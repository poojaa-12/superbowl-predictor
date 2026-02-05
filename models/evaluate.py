"""
Model evaluation module.
Generates calibration plots, ROC curves, and detailed metrics.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.calibration import calibration_curve
from sklearn.metrics import roc_curve, auc, confusion_matrix
from sklearn.model_selection import TimeSeriesSplit

from features.engineering import build_matchup_features
from models.train import load_model

PLOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "plots")


def _ensure_plots_dir() -> None:
    os.makedirs(PLOTS_DIR, exist_ok=True)


def plot_calibration_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    model_name: str,
    save: bool = True,
) -> None:
    """Plot calibration curve to verify predicted probabilities are meaningful."""
    _ensure_plots_dir()

    fraction_of_positives, mean_predicted_value = calibration_curve(
        y_true, y_prob, n_bins=10, strategy="uniform"
    )

    fig, ax = plt.subplots(1, 1, figsize=(8, 6))
    ax.plot(
        mean_predicted_value,
        fraction_of_positives,
        "s-",
        label=model_name,
        color="#002244",
    )
    ax.plot([0, 1], [0, 1], "k--", label="Perfectly calibrated")
    ax.set_xlabel("Mean Predicted Probability")
    ax.set_ylabel("Fraction of Positives")
    ax.set_title(f"Calibration Curve — {model_name}")
    ax.legend()
    ax.grid(alpha=0.3)

    if save:
        path = os.path.join(PLOTS_DIR, f"calibration_{model_name}.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  Saved calibration plot to {path}")

    plt.close(fig)


def plot_roc_curve(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    model_name: str,
    save: bool = True,
) -> None:
    """Plot ROC curve."""
    _ensure_plots_dir()

    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)

    fig, ax = plt.subplots(1, 1, figsize=(8, 6))
    ax.plot(fpr, tpr, color="#69BE28", lw=2, label=f"{model_name} (AUC={roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], "k--", lw=1)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title(f"ROC Curve — {model_name}")
    ax.legend()
    ax.grid(alpha=0.3)

    if save:
        path = os.path.join(PLOTS_DIR, f"roc_{model_name}.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  Saved ROC plot to {path}")

    plt.close(fig)


def plot_feature_importances(
    importances: pd.DataFrame,
    selected_features: list[str],
    save: bool = True,
) -> None:
    """Plot feature importances with selected features highlighted."""
    _ensure_plots_dir()

    fig, ax = plt.subplots(1, 1, figsize=(10, 6))

    df = importances.copy()
    df["selected"] = df["feature"].isin(selected_features)
    df = df.sort_values("importance", ascending=True)

    colors = ["#69BE28" if s else "#cccccc" for s in df["selected"]]
    ax.barh(df["feature"], df["importance"], color=colors)
    ax.set_xlabel("Importance")
    ax.set_title("Feature Importances (Random Forest)\nGreen = Selected for Model")
    ax.grid(axis="x", alpha=0.3)

    if save:
        path = os.path.join(PLOTS_DIR, "feature_importances.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  Saved feature importances plot to {path}")

    plt.close(fig)


def plot_correlation_matrix(
    matchups: pd.DataFrame,
    feature_names: list[str],
    save: bool = True,
) -> None:
    """Plot correlation matrix heatmap."""
    _ensure_plots_dir()

    corr = matchups[feature_names].corr()

    fig, ax = plt.subplots(1, 1, figsize=(10, 8))
    sns.heatmap(
        corr,
        annot=True,
        fmt=".2f",
        cmap="RdBu_r",
        center=0,
        square=True,
        ax=ax,
    )
    ax.set_title("Feature Correlation Matrix")

    if save:
        path = os.path.join(PLOTS_DIR, "correlation_matrix.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  Saved correlation matrix to {path}")

    plt.close(fig)


def plot_prediction_breakdown(
    features: dict,
    team_a: str,
    team_b: str,
    prob_a: float,
    save: bool = True,
) -> None:
    """
    Plot the feature contribution breakdown for a specific matchup.
    Shows which features favor which team.
    """
    _ensure_plots_dir()

    fig, ax = plt.subplots(1, 1, figsize=(10, 6))

    feat_names = list(features.keys())
    feat_values = list(features.values())

    colors = ["#69BE28" if v > 0 else "#C60C30" for v in feat_values]
    y_pos = range(len(feat_names))

    ax.barh(y_pos, feat_values, color=colors)
    ax.set_yticks(y_pos)
    ax.set_yticklabels([f.replace("_diff", "").replace("_", " ").title() for f in feat_names])
    ax.set_xlabel("Differential (positive favors " + team_a + ")")
    ax.set_title(f"Feature Breakdown: {team_a} vs {team_b}")
    ax.axvline(x=0, color="black", linewidth=0.8)
    ax.grid(axis="x", alpha=0.3)

    # Add team labels
    ax.text(0.02, 0.98, f"← Favors {team_b}", transform=ax.transAxes,
            fontsize=10, color="#C60C30", va="top")
    ax.text(0.98, 0.98, f"Favors {team_a} →", transform=ax.transAxes,
            fontsize=10, color="#69BE28", va="top", ha="right")

    if save:
        path = os.path.join(PLOTS_DIR, f"breakdown_{team_a}_vs_{team_b}.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  Saved prediction breakdown to {path}")

    plt.close(fig)


def generate_all_plots(seasons: list[int]) -> None:
    """Generate all evaluation plots."""
    from features.engineering import build_matchup_features, get_feature_names

    print("Generating evaluation plots...")
    _ensure_plots_dir()

    matchups = build_matchup_features(seasons)
    feature_names = get_feature_names()

    for model_name in ["logistic_regression", "random_forest"]:
        try:
            model, scaler, metadata = load_model(model_name)
            selected = metadata["selected_features"]

            X = matchups[selected].values
            y = matchups["home_win"].values
            X_scaled = scaler.transform(X)

            y_prob = model.predict_proba(X_scaled)[:, 1]

            plot_calibration_curve(y, y_prob, model_name)
            plot_roc_curve(y, y_prob, model_name)
        except Exception as e:
            print(f"  Could not generate plots for {model_name}: {e}")

    # Feature importances
    try:
        _, _, metadata = load_model("logistic_regression")
        importances = pd.DataFrame(metadata["feature_importances"])
        plot_feature_importances(importances, metadata["selected_features"])
    except Exception as e:
        print(f"  Could not generate feature importance plot: {e}")

    # Correlation matrix
    plot_correlation_matrix(matchups, feature_names)

    print("All plots saved to plots/ directory")


if __name__ == "__main__":
    seasons = list(range(2010, 2025))
    generate_all_plots(seasons)
