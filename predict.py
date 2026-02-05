"""
CLI prediction script.
Predicts the Super Bowl winner between two teams.

Usage:
    python predict.py                       # Default: SEA vs NE
    python predict.py --team_a SEA --team_b NE --season 2014
"""

import argparse
import numpy as np
import pandas as pd

from features.engineering import build_team_features, prepare_prediction_features
from models.train import load_model
from models.evaluate import plot_prediction_breakdown


# NFL team abbreviation to full name mapping
TEAM_NAMES = {
    "SEA": "Seattle Seahawks",
    "NE": "New England Patriots",
    "KC": "Kansas City Chiefs",
    "SF": "San Francisco 49ers",
    "BUF": "Buffalo Bills",
    "PHI": "Philadelphia Eagles",
    "DAL": "Dallas Cowboys",
    "GB": "Green Bay Packers",
    "BAL": "Baltimore Ravens",
    "CIN": "Cincinnati Bengals",
    "DET": "Detroit Lions",
    "MIN": "Minnesota Vikings",
    "DEN": "Denver Broncos",
    "LAR": "Los Angeles Rams",
    "TB": "Tampa Bay Buccaneers",
    "MIA": "Miami Dolphins",
}


def predict_matchup(
    team_a: str = "SEA",
    team_b: str = "NE",
    season: int = 2014,
    model_name: str = "logistic_regression",
) -> dict:
    """
    Predict the outcome of a matchup between two teams.

    Returns dict with probabilities, features, and model info.
    """
    # Load model
    model, scaler, metadata = load_model(model_name)
    selected_features = metadata["selected_features"]

    # Build team features
    team_features = build_team_features([season])

    # Prepare matchup features
    raw_features = prepare_prediction_features(
        team_features, team_a, team_b, season, neutral_site=True
    )

    # Select only the features used by the model
    feature_values = {f: raw_features[f] for f in selected_features}
    X = np.array([[feature_values[f] for f in selected_features]])
    X_scaled = scaler.transform(X)

    # Predict
    proba = model.predict_proba(X_scaled)[0]

    # Bootstrap confidence interval
    n_bootstrap = 1000
    bootstrap_probs = []
    rng = np.random.RandomState(42)
    for _ in range(n_bootstrap):
        noise = rng.normal(0, 0.02, X_scaled.shape)
        X_noisy = X_scaled + noise
        bp = model.predict_proba(X_noisy)[0]
        bootstrap_probs.append(bp[0])

    ci_lower = np.percentile(bootstrap_probs, 2.5)
    ci_upper = np.percentile(bootstrap_probs, 97.5)

    result = {
        "team_a": {
            "abbr": team_a,
            "name": TEAM_NAMES.get(team_a, team_a),
            "win_prob": float(proba[1]),  # "home" position = team_a
        },
        "team_b": {
            "abbr": team_b,
            "name": TEAM_NAMES.get(team_b, team_b),
            "win_prob": float(proba[0]),
        },
        "confidence_interval": [float(ci_lower), float(ci_upper)],
        "model_used": model_name,
        "season": season,
        "feature_contributions": [],
    }

    # Feature contributions
    for feat in selected_features:
        val = feature_values[feat]
        result["feature_contributions"].append({
            "feature": feat,
            "value": float(val),
            "favors": team_a if val > 0 else team_b,
        })

    return result


def main():
    parser = argparse.ArgumentParser(description="Predict Super Bowl winner")
    parser.add_argument("--team_a", default="SEA", help="Team A abbreviation (default: SEA)")
    parser.add_argument("--team_b", default="NE", help="Team B abbreviation (default: NE)")
    parser.add_argument("--season", type=int, default=2014, help="Season year (default: 2014)")
    parser.add_argument("--model", default="logistic_regression",
                        choices=["logistic_regression", "random_forest"],
                        help="Model to use (default: logistic_regression)")
    args = parser.parse_args()

    print("=" * 60)
    print(f"  SUPER BOWL PREDICTION")
    print(f"  {TEAM_NAMES.get(args.team_a, args.team_a)} vs {TEAM_NAMES.get(args.team_b, args.team_b)}")
    print(f"  Season: {args.season} | Model: {args.model}")
    print("=" * 60)

    # Predict with both models for comparison
    for model_name in ["logistic_regression", "random_forest"]:
        print(f"\n--- {model_name.replace('_', ' ').title()} ---")
        result = predict_matchup(args.team_a, args.team_b, args.season, model_name)

        team_a_info = result["team_a"]
        team_b_info = result["team_b"]

        print(f"  {team_a_info['name']:30s} {team_a_info['win_prob']:6.1%}")
        print(f"  {team_b_info['name']:30s} {team_b_info['win_prob']:6.1%}")
        print(f"  Confidence interval: [{result['confidence_interval'][0]:.1%}, {result['confidence_interval'][1]:.1%}]")

        print(f"\n  Feature Breakdown:")
        for fc in result["feature_contributions"]:
            direction = "→" if fc["favors"] == args.team_a else "←"
            label = fc["feature"].replace("_diff", "").replace("_", " ").title()
            print(f"    {label:30s} {fc['value']:+8.3f}  {direction} {fc['favors']}")

    # Generate visual breakdown for the primary model
    print("\n\nGenerating prediction breakdown chart...")
    result = predict_matchup(args.team_a, args.team_b, args.season, args.model)
    features_for_plot = {
        fc["feature"]: fc["value"] for fc in result["feature_contributions"]
    }
    plot_prediction_breakdown(
        features_for_plot, args.team_a, args.team_b, result["team_a"]["win_prob"]
    )

    # Final verdict
    winner = result["team_a"] if result["team_a"]["win_prob"] > 0.5 else result["team_b"]
    print(f"\n{'=' * 60}")
    print(f"  PREDICTION: {winner['name']} win with {winner['win_prob']:.1%} probability")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
