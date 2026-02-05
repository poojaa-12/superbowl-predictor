"""
Model training module.
Trains Logistic Regression and Random Forest with time-series cross-validation.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    log_loss,
    roc_auc_score,
)

from features.engineering import build_matchup_features, get_feature_names
from features.selection import select_features

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved")


def _ensure_models_dir() -> None:
    os.makedirs(MODELS_DIR, exist_ok=True)


def train_and_evaluate(
    seasons: list[int],
    n_splits: int = 5,
) -> dict:
    """
    Full training pipeline:
    1. Feature selection via Random Forest
    2. Train Logistic Regression (L2 regularized) with time-series CV
    3. Train Random Forest as comparison
    4. Evaluate both on held-out time periods
    5. Save best models

    Returns dict with models, metrics, and feature info.
    """
    _ensure_models_dir()

    # --- Feature Selection ---
    print("=" * 60)
    print("STEP 1: Feature Selection")
    print("=" * 60)
    selection_result = select_features(seasons)
    selected_features = selection_result["selected_features"]

    # --- Build Training Data ---
    print("\n" + "=" * 60)
    print("STEP 2: Building Training Data")
    print("=" * 60)
    matchups = build_matchup_features(seasons)

    # Sort by season and week for proper time-series split
    matchups = matchups.sort_values(["season", "week"]).reset_index(drop=True)

    X = matchups[selected_features].values
    y = matchups["home_win"].values
    seasons_arr = matchups["season"].values
    game_types = matchups["game_type"].values

    print(f"  Total samples: {len(X)}")
    print(f"  Features used: {len(selected_features)}")
    print(f"  Samples-to-features ratio: {len(X) / len(selected_features):.0f}:1")
    print(f"  Target distribution: {y.mean():.3f} home win rate")

    # --- Standardize features ---
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # --- Time-Series Cross-Validation ---
    print("\n" + "=" * 60)
    print("STEP 3: Time-Series Cross-Validation")
    print("=" * 60)

    tscv = TimeSeriesSplit(n_splits=n_splits)

    models_config = {
        "logistic_regression": LogisticRegression(
            C=1.0,  # Will be tuned
            penalty="l2",
            solver="lbfgs",
            max_iter=1000,
            random_state=42,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=5,
            min_samples_leaf=20,
            random_state=42,
            n_jobs=-1,
        ),
    }

    # Try multiple regularization strengths for logistic regression
    best_C = 1.0
    best_lr_score = -np.inf
    for C in [0.01, 0.1, 0.5, 1.0, 5.0, 10.0]:
        lr = LogisticRegression(C=C, penalty="l2", solver="lbfgs", max_iter=1000, random_state=42)
        scores = []
        for train_idx, val_idx in tscv.split(X_scaled):
            lr.fit(X_scaled[train_idx], y[train_idx])
            prob = lr.predict_proba(X_scaled[val_idx])[:, 1]
            scores.append(roc_auc_score(y[val_idx], prob))
        avg_score = np.mean(scores)
        if avg_score > best_lr_score:
            best_lr_score = avg_score
            best_C = C

    print(f"  Best regularization C={best_C} (AUC={best_lr_score:.4f})")
    models_config["logistic_regression"].C = best_C

    # --- Evaluate Both Models ---
    results = {}
    for model_name, model in models_config.items():
        print(f"\n--- {model_name} ---")
        fold_metrics = {"accuracy": [], "log_loss": [], "roc_auc": []}

        for fold, (train_idx, val_idx) in enumerate(tscv.split(X_scaled)):
            X_train, X_val = X_scaled[train_idx], X_scaled[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]

            model.fit(X_train, y_train)
            y_pred = model.predict(X_val)
            y_prob = model.predict_proba(X_val)[:, 1]

            acc = accuracy_score(y_val, y_pred)
            ll = log_loss(y_val, y_prob)
            auc = roc_auc_score(y_val, y_prob)

            fold_metrics["accuracy"].append(acc)
            fold_metrics["log_loss"].append(ll)
            fold_metrics["roc_auc"].append(auc)

            print(f"  Fold {fold + 1}: Acc={acc:.4f}  LogLoss={ll:.4f}  AUC={auc:.4f}")

        avg_metrics = {k: float(np.mean(v)) for k, v in fold_metrics.items()}
        std_metrics = {f"{k}_std": float(np.std(v)) for k, v in fold_metrics.items()}
        print(f"  AVERAGE: Acc={avg_metrics['accuracy']:.4f}  "
              f"LogLoss={avg_metrics['log_loss']:.4f}  AUC={avg_metrics['roc_auc']:.4f}")

        results[model_name] = {
            "metrics": {**avg_metrics, **std_metrics},
            "fold_metrics": {k: [float(x) for x in v] for k, v in fold_metrics.items()},
        }

    # --- Train Final Models on Full Data ---
    print("\n" + "=" * 60)
    print("STEP 4: Training Final Models on Full Data")
    print("=" * 60)

    # Apply sample weights: playoff games get 2x weight
    sample_weights = np.where(game_types != "REG", 2.0, 1.0)

    final_models = {}
    for model_name, model in models_config.items():
        model.fit(X_scaled, y, sample_weight=sample_weights)
        final_models[model_name] = model
        print(f"  Trained final {model_name}")

        # Save model
        model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
        joblib.dump(model, model_path)
        print(f"  Saved to {model_path}")

    # Save scaler
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    joblib.dump(scaler, scaler_path)

    # Save metadata
    metadata = {
        "selected_features": selected_features,
        "feature_importances": selection_result["importances"].to_dict("records"),
        "best_C": best_C,
        "seasons": seasons,
        "total_samples": len(X),
        "model_metrics": {name: info["metrics"] for name, info in results.items()},
    }
    metadata_path = os.path.join(MODELS_DIR, "metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Saved metadata to {metadata_path}")

    # --- Logistic Regression Coefficients ---
    lr_model = final_models["logistic_regression"]
    print("\n=== Logistic Regression Coefficients ===")
    coefs = pd.DataFrame({
        "feature": selected_features,
        "coefficient": lr_model.coef_[0],
    }).sort_values("coefficient", key=abs, ascending=False)

    for _, row in coefs.iterrows():
        direction = "→ HOME" if row["coefficient"] > 0 else "→ AWAY"
        print(f"  {row['feature']:35s} {row['coefficient']:+.4f} {direction}")

    return {
        "models": final_models,
        "scaler": scaler,
        "results": results,
        "selected_features": selected_features,
        "importances": selection_result["importances"],
        "metadata": metadata,
    }


def load_model(model_name: str = "logistic_regression"):
    """Load a saved model, scaler, and metadata."""
    model_path = os.path.join(MODELS_DIR, f"{model_name}.joblib")
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    metadata_path = os.path.join(MODELS_DIR, "metadata.json")

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    with open(metadata_path, "r") as f:
        metadata = json.load(f)

    return model, scaler, metadata


if __name__ == "__main__":
    seasons = list(range(2010, 2025))
    result = train_and_evaluate(seasons)

    print("\n" + "=" * 60)
    print("FINAL MODEL COMPARISON")
    print("=" * 60)
    for name, info in result["results"].items():
        m = info["metrics"]
        print(f"\n{name}:")
        print(f"  Accuracy:  {m['accuracy']:.4f} ± {m['accuracy_std']:.4f}")
        print(f"  Log Loss:  {m['log_loss']:.4f} ± {m['log_loss_std']:.4f}")
        print(f"  ROC AUC:   {m['roc_auc']:.4f} ± {m['roc_auc_std']:.4f}")
