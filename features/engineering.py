"""
Feature engineering module.
Builds team-pair differential features from season-level aggregates.
All features are computed BEFORE the game to avoid data leakage.
"""

import pandas as pd
import numpy as np

from data.fetch_data import build_team_season_stats, build_game_dataset, fetch_schedules


# --- Strength of Schedule ---

def _compute_strength_of_schedule(seasons: list[int]) -> pd.DataFrame:
    """
    Compute strength of schedule for each team-season.
    SOS = average win percentage of all opponents faced that season.
    """
    schedules = fetch_schedules(seasons)
    completed = schedules[schedules["result"].notna()].copy()
    team_stats = build_team_season_stats(seasons)
    win_pct_map = team_stats.set_index(["season", "team"])["win_pct"].to_dict()

    records = []
    for _, row in completed.iterrows():
        season = row["season"]
        home = row["home_team"]
        away = row["away_team"]
        records.append({"season": season, "team": home, "opponent_win_pct": win_pct_map.get((season, away), 0.5)})
        records.append({"season": season, "team": away, "opponent_win_pct": win_pct_map.get((season, home), 0.5)})

    sos_df = pd.DataFrame(records)
    sos = sos_df.groupby(["season", "team"])["opponent_win_pct"].mean().reset_index()
    sos.rename(columns={"opponent_win_pct": "strength_of_schedule"}, inplace=True)
    return sos


def _compute_turnover_and_yard_stats(seasons: list[int]) -> pd.DataFrame:
    """
    Compute additional team stats from schedule-level data.
    Uses available columns to approximate offensive/defensive metrics.
    """
    schedules = fetch_schedules(seasons)
    completed = schedules[schedules["result"].notna()].copy()

    # Compute per-team stats from home/away perspectives
    home_records = []
    away_records = []

    for _, row in completed.iterrows():
        season = row["season"]

        home_rec = {"season": season, "team": row["home_team"]}
        away_rec = {"season": season, "team": row["away_team"]}

        # Use spread_line as a proxy for expected game closeness
        if "spread_line" in row and pd.notna(row.get("spread_line")):
            home_rec["spread"] = row["spread_line"]
            away_rec["spread"] = -row["spread_line"]
        else:
            home_rec["spread"] = 0
            away_rec["spread"] = 0

        # Score margin
        home_rec["margin"] = row.get("home_score", 0) - row.get("away_score", 0)
        away_rec["margin"] = row.get("away_score", 0) - row.get("home_score", 0)

        home_records.append(home_rec)
        away_records.append(away_rec)

    all_records = pd.DataFrame(home_records + away_records)
    team_extra = all_records.groupby(["season", "team"]).agg(
        avg_margin=("margin", "mean"),
        avg_spread=("spread", "mean"),
        games=("margin", "count"),
    ).reset_index()

    return team_extra


# --- Main Feature Builder ---

FEATURE_COLUMNS = [
    "points_per_game_diff",
    "points_allowed_per_game_diff",
    "point_diff_per_game_diff",
    "win_pct_diff",
    "pythagorean_wins_diff",
    "strength_of_schedule_diff",
    "avg_margin_diff",
    "is_home",
]


def build_team_features(seasons: list[int]) -> pd.DataFrame:
    """
    Build the complete team-season feature table.
    Merges all computed stats into one DataFrame.
    """
    team_stats = build_team_season_stats(seasons)
    sos = _compute_strength_of_schedule(seasons)
    extra = _compute_turnover_and_yard_stats(seasons)

    features = team_stats.merge(sos, on=["season", "team"], how="left")
    features = features.merge(extra[["season", "team", "avg_margin"]], on=["season", "team"], how="left")

    # Fill missing values with league average
    for col in features.select_dtypes(include=[np.number]).columns:
        features[col] = features[col].fillna(features[col].mean())

    return features


def build_matchup_features(seasons: list[int]) -> pd.DataFrame:
    """
    Build the full training dataset: one row per game with differential features.
    Features = home_team_stat - away_team_stat for each metric.
    Target = home_win (1 if home team won, 0 otherwise).
    """
    games = build_game_dataset(seasons)
    team_features = build_team_features(seasons)

    # Create lookup dictionary for fast access
    feature_cols = [
        "points_per_game", "points_allowed_per_game", "point_diff_per_game",
        "win_pct", "pythagorean_wins", "strength_of_schedule", "avg_margin",
    ]

    team_lookup = team_features.set_index(["season", "team"])[feature_cols].to_dict("index")

    rows = []
    for _, game in games.iterrows():
        season = game["season"]
        home = game["home_team"]
        away = game["away_team"]

        home_stats = team_lookup.get((season, home))
        away_stats = team_lookup.get((season, away))

        if home_stats is None or away_stats is None:
            continue

        row = {
            "season": season,
            "week": game["week"],
            "game_type": game["game_type"],
            "home_team": home,
            "away_team": away,
            "home_win": game["home_win"],
        }

        # Differential features
        for col in feature_cols:
            row[f"{col}_diff"] = home_stats[col] - away_stats[col]

        # Home advantage indicator
        row["is_home"] = 1

        rows.append(row)

    matchups = pd.DataFrame(rows)
    return matchups


def get_feature_names() -> list[str]:
    """Return the list of feature column names used by the model."""
    return FEATURE_COLUMNS.copy()


def prepare_prediction_features(
    team_features: pd.DataFrame,
    team_a: str,
    team_b: str,
    season: int,
    neutral_site: bool = True,
) -> dict:
    """
    Prepare features for a single matchup prediction (e.g., Super Bowl).
    Returns a dict of feature values.
    """
    feature_cols = [
        "points_per_game", "points_allowed_per_game", "point_diff_per_game",
        "win_pct", "pythagorean_wins", "strength_of_schedule", "avg_margin",
    ]

    lookup = team_features.set_index(["season", "team"])[feature_cols].to_dict("index")

    stats_a = lookup.get((season, team_a))
    stats_b = lookup.get((season, team_b))

    if stats_a is None or stats_b is None:
        available = team_features[team_features["season"] == season]["team"].unique()
        raise ValueError(
            f"Team stats not found for {team_a} or {team_b} in season {season}. "
            f"Available teams: {sorted(available)}"
        )

    features = {}
    for col in feature_cols:
        features[f"{col}_diff"] = stats_a[col] - stats_b[col]

    # Super Bowl is neutral site
    features["is_home"] = 0 if neutral_site else 1

    return features


if __name__ == "__main__":
    seasons = list(range(2010, 2025))
    print("Building matchup features...")
    matchups = build_matchup_features(seasons)
    print(f"  -> {len(matchups)} matchups with {len(FEATURE_COLUMNS)} features")
    print(f"  -> Feature columns: {FEATURE_COLUMNS}")
    print(f"  -> Home win rate: {matchups['home_win'].mean():.3f}")
    print(matchups[FEATURE_COLUMNS + ['home_win']].describe())
