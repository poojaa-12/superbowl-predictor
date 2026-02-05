"""
FastAPI backend for the Super Bowl Predictor.
Serves model predictions as JSON with CORS enabled for the Lovable frontend.
"""

import numpy as np
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from predict import predict_matchup, TEAM_NAMES
from features.engineering import (
    build_team_features,
    build_matchup_features,
    get_feature_names,
)
from data.fetch_data import build_team_season_stats
from models.train import load_model

SEASONS = list(range(2010, 2025))

app = FastAPI(
    title="Super Bowl Predictor API",
    description="ML-powered Super Bowl winner prediction (Seahawks vs Patriots)",
    version="1.0.0",
)

# Enable CORS for Lovable frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lovable dev and production URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Response Models ---

class TeamPrediction(BaseModel):
    abbr: str
    name: str
    win_prob: float


class FeatureContribution(BaseModel):
    feature: str
    value: float
    favors: str


class PredictionResponse(BaseModel):
    team_a: TeamPrediction
    team_b: TeamPrediction
    confidence_interval: list[float]
    model_used: str
    season: int
    feature_contributions: list[FeatureContribution]


class TeamStats(BaseModel):
    team: str
    name: str
    season: int
    points_per_game: float
    points_allowed_per_game: float
    point_diff_per_game: float
    win_pct: float
    pythagorean_wins: float
    strength_of_schedule: float | None = None
    avg_margin: float | None = None


class FeatureImportance(BaseModel):
    feature: str
    importance: float
    selected: bool


class ModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    accuracy_std: float
    log_loss: float
    log_loss_std: float
    roc_auc: float
    roc_auc_std: float


# --- Endpoints ---

@app.get("/")
def root():
    return {
        "service": "Super Bowl Predictor API",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "Get win probability prediction for two teams",
            "/stats": "Get team season stats",
            "/features": "Get feature importances and model metrics",
            "/teams": "List available teams",
        },
    }


@app.get("/predict", response_model=PredictionResponse)
def predict(
    team_a: str = Query(default="SEA", description="Team A abbreviation"),
    team_b: str = Query(default="NE", description="Team B abbreviation"),
    season: int = Query(default=2014, description="Season year"),
    model: str = Query(default="logistic_regression", description="Model name"),
):
    """Predict the winner of a matchup between two teams."""
    result = predict_matchup(
        team_a=team_a.upper(),
        team_b=team_b.upper(),
        season=season,
        model_name=model,
    )
    return result


@app.get("/stats", response_model=TeamStats)
def stats(
    team: str = Query(default="SEA", description="Team abbreviation"),
    season: int = Query(default=2014, description="Season year"),
):
    """Get season stats for a specific team."""
    team = team.upper()
    team_features = build_team_features([season])

    row = team_features[
        (team_features["team"] == team) & (team_features["season"] == season)
    ]

    if row.empty:
        available = team_features["team"].unique().tolist()
        return {"error": f"Team {team} not found. Available: {sorted(available)}"}

    row = row.iloc[0]
    return TeamStats(
        team=team,
        name=TEAM_NAMES.get(team, team),
        season=season,
        points_per_game=float(row["points_per_game"]),
        points_allowed_per_game=float(row["points_allowed_per_game"]),
        point_diff_per_game=float(row["point_diff_per_game"]),
        win_pct=float(row["win_pct"]),
        pythagorean_wins=float(row["pythagorean_wins"]),
        strength_of_schedule=float(row.get("strength_of_schedule", 0)),
        avg_margin=float(row.get("avg_margin", 0)),
    )


@app.get("/features")
def features():
    """Get feature importances and model comparison metrics."""
    try:
        _, _, metadata = load_model("logistic_regression")
    except Exception:
        return {"error": "Models not trained yet. Run: python -m models.train"}

    # Feature importances
    importances = [
        FeatureImportance(
            feature=fi["feature"],
            importance=fi["importance"],
            selected=fi["feature"] in metadata["selected_features"],
        )
        for fi in metadata["feature_importances"]
    ]

    # Model metrics comparison
    model_metrics = []
    for name, metrics in metadata.get("model_metrics", {}).items():
        model_metrics.append(ModelMetrics(
            model_name=name,
            accuracy=metrics["accuracy"],
            accuracy_std=metrics["accuracy_std"],
            log_loss=metrics["log_loss"],
            log_loss_std=metrics["log_loss_std"],
            roc_auc=metrics["roc_auc"],
            roc_auc_std=metrics["roc_auc_std"],
        ))

    return {
        "selected_features": metadata["selected_features"],
        "all_importances": importances,
        "model_comparison": model_metrics,
        "total_training_samples": metadata["total_samples"],
        "seasons_used": metadata["seasons"],
    }


@app.get("/teams")
def teams():
    """List all available team abbreviations and names."""
    return {
        "teams": [
            {"abbr": abbr, "name": name}
            for abbr, name in sorted(TEAM_NAMES.items())
        ]
    }


# --- EDA Endpoints ---

@app.get("/eda/team-history")
def eda_team_history(
    team_a: str = Query(default="SEA", description="Team A abbreviation"),
    team_b: str = Query(default="NE", description="Team B abbreviation"),
):
    """Return season-by-season stats for two teams across all seasons."""
    team_a = team_a.upper()
    team_b = team_b.upper()
    team_stats = build_team_season_stats(SEASONS)

    result = {}
    for team in [team_a, team_b]:
        rows = team_stats[team_stats["team"] == team].sort_values("season")
        result[team] = [
            {
                "season": int(r["season"]),
                "win_pct": round(float(r["win_pct"]), 3),
                "points_per_game": round(float(r["points_per_game"]), 1),
                "points_allowed_per_game": round(float(r["points_allowed_per_game"]), 1),
                "point_diff_per_game": round(float(r["point_diff_per_game"]), 1),
            }
            for _, r in rows.iterrows()
        ]

    return {
        "team_a": {"abbr": team_a, "name": TEAM_NAMES.get(team_a, team_a), "seasons": result[team_a]},
        "team_b": {"abbr": team_b, "name": TEAM_NAMES.get(team_b, team_b), "seasons": result[team_b]},
    }


@app.get("/eda/feature-distributions")
def eda_feature_distributions():
    """Return histogram data for each feature, split by home win / home loss."""
    matchups = build_matchup_features(SEASONS)
    feature_names = get_feature_names()

    distributions = []
    for feat in feature_names:
        wins = matchups[matchups["home_win"] == 1][feat].dropna().values
        losses = matchups[matchups["home_win"] == 0][feat].dropna().values

        # Compute shared bins
        all_vals = np.concatenate([wins, losses])
        bin_edges = np.linspace(float(all_vals.min()), float(all_vals.max()), 21)

        win_counts, _ = np.histogram(wins, bins=bin_edges, density=True)
        loss_counts, _ = np.histogram(losses, bins=bin_edges, density=True)

        # Build bin centers for the frontend
        bin_centers = [(float(bin_edges[i]) + float(bin_edges[i + 1])) / 2 for i in range(len(bin_edges) - 1)]

        distributions.append({
            "feature": feat,
            "label": feat.replace("_diff", "").replace("_", " ").title(),
            "bins": [round(b, 3) for b in bin_centers],
            "home_win": [round(float(v), 4) for v in win_counts],
            "home_loss": [round(float(v), 4) for v in loss_counts],
        })

    return {
        "total_matchups": len(matchups),
        "home_win_rate": round(float(matchups["home_win"].mean()), 3),
        "distributions": distributions,
    }


@app.get("/eda/correlation-matrix")
def eda_correlation_matrix():
    """Return feature correlation matrix and highly correlated pairs."""
    matchups = build_matchup_features(SEASONS)
    feature_names = get_feature_names()
    corr = matchups[feature_names].corr()

    labels = [f.replace("_diff", "").replace("_", " ").title() for f in feature_names]
    matrix = [[round(float(corr.iloc[i, j]), 3) for j in range(len(feature_names))] for i in range(len(feature_names))]

    high_pairs = []
    for i in range(len(feature_names)):
        for j in range(i + 1, len(feature_names)):
            r = float(corr.iloc[i, j])
            if abs(r) > 0.7:
                high_pairs.append({
                    "feat_a": labels[i],
                    "feat_b": labels[j],
                    "r": round(r, 3),
                })

    return {
        "features": feature_names,
        "labels": labels,
        "matrix": matrix,
        "high_pairs": high_pairs,
    }


@app.get("/eda/home-win-rates")
def eda_home_win_rates():
    """Return home win rate by game type."""
    matchups = build_matchup_features(SEASONS)
    grouped = matchups.groupby("game_type").agg(
        count=("home_win", "count"),
        home_win_rate=("home_win", "mean"),
    ).reset_index()

    return {
        "game_types": [
            {
                "game_type": str(row["game_type"]),
                "count": int(row["count"]),
                "home_win_rate": round(float(row["home_win_rate"]), 3),
            }
            for _, row in grouped.iterrows()
        ]
    }


@app.get("/eda/matchup-comparison")
def eda_matchup_comparison(
    team_a: str = Query(default="SEA", description="Team A abbreviation"),
    team_b: str = Query(default="NE", description="Team B abbreviation"),
    season: int = Query(default=2014, description="Season year"),
):
    """Return head-to-head stat comparison for a specific season."""
    team_a = team_a.upper()
    team_b = team_b.upper()
    team_features = build_team_features([season])

    row_a = team_features[(team_features["team"] == team_a) & (team_features["season"] == season)]
    row_b = team_features[(team_features["team"] == team_b) & (team_features["season"] == season)]

    if row_a.empty or row_b.empty:
        return {"error": f"Stats not found for {team_a} or {team_b} in {season}"}

    row_a = row_a.iloc[0]
    row_b = row_b.iloc[0]

    compare_cols = [
        "points_per_game", "points_allowed_per_game", "point_diff_per_game",
        "win_pct", "pythagorean_wins",
    ]

    comparison = []
    for col in compare_cols:
        val_a = float(row_a[col])
        val_b = float(row_b[col])
        # For points_allowed, lower is better
        if col == "points_allowed_per_game":
            advantage = team_a if val_a < val_b else team_b
        else:
            advantage = team_a if val_a > val_b else team_b
        comparison.append({
            "stat": col.replace("_", " ").title(),
            "team_a_value": round(val_a, 3),
            "team_b_value": round(val_b, 3),
            "advantage": advantage,
        })

    return {
        "team_a": {"abbr": team_a, "name": TEAM_NAMES.get(team_a, team_a)},
        "team_b": {"abbr": team_b, "name": TEAM_NAMES.get(team_b, team_b)},
        "season": season,
        "comparison": comparison,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
