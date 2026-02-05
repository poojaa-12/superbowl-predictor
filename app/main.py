"""
FastAPI backend for the Super Bowl Predictor.
Serves model predictions as JSON with CORS enabled for the Lovable frontend.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from predict import predict_matchup, TEAM_NAMES
from features.engineering import build_team_features
from models.train import load_model

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
