"""
Feature selection module.
Uses Random Forest importance and correlation filtering to select
the best features and avoid overfitting.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit

from features.engineering import build_matchup_features, get_feature_names


def compute_feature_importances(
    X: pd.DataFrame,
    y: pd.Series,
    n_estimators: int = 200,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Train a Random Forest and extract feature importances.
    Returns a DataFrame sorted by importance (descending).
    """
    rf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=5,  # Shallow trees to reduce overfitting
        min_samples_leaf=20,
        random_state=random_state,
        n_jobs=-1,
    )
    rf.fit(X, y)

    importances = pd.DataFrame({
        "feature": X.columns,
        "importance": rf.feature_importances_,
    }).sort_values("importance", ascending=False).reset_index(drop=True)

    return importances


def filter_correlated_features(
    X: pd.DataFrame,
    threshold: float = 0.85,
) -> list[str]:
    """
    Remove features with Pearson correlation > threshold.
    Keeps the feature with higher variance when a correlated pair is found.
    Returns list of features to keep.
    """
    corr_matrix = X.corr().abs()
    upper_triangle = corr_matrix.where(
        np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
    )

    to_drop = set()
    for col in upper_triangle.columns:
        correlated = upper_triangle.index[upper_triangle[col] > threshold].tolist()
        for corr_col in correlated:
            # Drop the one with lower variance
            if X[col].var() >= X[corr_col].var():
                to_drop.add(corr_col)
            else:
                to_drop.add(col)

    kept = [c for c in X.columns if c not in to_drop]
    return kept, list(to_drop)


def select_features(
    seasons: list[int],
    importance_threshold: float = 0.05,
    correlation_threshold: float = 0.85,
    max_features: int = 12,
) -> dict:
    """
    Full feature selection pipeline:
    1. Build matchup features
    2. Compute Random Forest importances
    3. Filter low-importance features
    4. Remove highly correlated features
    5. Cap at max_features

    Returns dict with:
        - selected_features: list of feature names to use
        - importances: DataFrame of all features with importance scores
        - dropped_correlated: list of features dropped due to correlation
        - correlation_matrix: full correlation matrix
    """
    feature_names = get_feature_names()
    matchups = build_matchup_features(seasons)

    X = matchups[feature_names]
    y = matchups["home_win"]

    # Step 1: Random Forest importances
    importances = compute_feature_importances(X, y)
    print("\n=== Feature Importances (Random Forest) ===")
    for _, row in importances.iterrows():
        bar = "█" * int(row["importance"] * 100)
        print(f"  {row['feature']:35s} {row['importance']:.4f} {bar}")

    # Step 2: Filter low-importance features
    important = importances[importances["importance"] >= importance_threshold]
    important_features = important["feature"].tolist()
    print(f"\n  Kept {len(important_features)} features above threshold {importance_threshold}")

    # Step 3: Correlation filtering
    X_important = X[important_features]
    kept_features, dropped = filter_correlated_features(
        X_important, threshold=correlation_threshold
    )
    if dropped:
        print(f"  Dropped {len(dropped)} correlated features: {dropped}")
    else:
        print("  No highly correlated features found")

    # Step 4: Cap at max_features
    # Re-rank by importance and take top N
    kept_importances = importances[importances["feature"].isin(kept_features)]
    selected = kept_importances.head(max_features)["feature"].tolist()

    print(f"\n=== Final Selected Features ({len(selected)}) ===")
    for feat in selected:
        imp = importances[importances["feature"] == feat]["importance"].values[0]
        print(f"  ✓ {feat:35s} (importance: {imp:.4f})")

    return {
        "selected_features": selected,
        "importances": importances,
        "dropped_correlated": dropped,
        "correlation_matrix": X.corr(),
    }


if __name__ == "__main__":
    seasons = list(range(2010, 2025))
    result = select_features(seasons)
    print(f"\nSelected {len(result['selected_features'])} features for the model")
