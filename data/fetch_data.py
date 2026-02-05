"""
Data fetching module using nfl_data_py.
Pulls seasonal team stats and game schedules for the ML pipeline.
"""

import os
import pandas as pd
import nfl_data_py as nfl

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")


def _ensure_cache_dir() -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)


def fetch_schedules(seasons: list[int], use_cache: bool = True) -> pd.DataFrame:
    """
    Fetch NFL game schedules (results) for the given seasons.
    Returns one row per game with home/away teams and scores.
    """
    _ensure_cache_dir()
    cache_path = os.path.join(CACHE_DIR, "schedules.parquet")

    if use_cache and os.path.exists(cache_path):
        df = pd.read_parquet(cache_path)
        cached_seasons = df["season"].unique().tolist()
        if set(seasons).issubset(set(cached_seasons)):
            return df[df["season"].isin(seasons)].reset_index(drop=True)

    df = nfl.import_schedules(seasons)
    df.to_parquet(cache_path, index=False)
    return df[df["season"].isin(seasons)].reset_index(drop=True)


def fetch_seasonal_data(seasons: list[int], use_cache: bool = True) -> pd.DataFrame:
    """
    Fetch team-level seasonal stats (offensive and defensive aggregates).
    """
    _ensure_cache_dir()
    cache_path = os.path.join(CACHE_DIR, "seasonal.parquet")

    if use_cache and os.path.exists(cache_path):
        df = pd.read_parquet(cache_path)
        cached_seasons = df["season"].unique().tolist()
        if set(seasons).issubset(set(cached_seasons)):
            return df[df["season"].isin(seasons)].reset_index(drop=True)

    df = nfl.import_seasonal_data(seasons)
    df.to_parquet(cache_path, index=False)
    return df[df["season"].isin(seasons)].reset_index(drop=True)


def fetch_weekly_data(seasons: list[int], use_cache: bool = True) -> pd.DataFrame:
    """
    Fetch weekly team-level stats for computing rolling aggregates.
    """
    _ensure_cache_dir()
    cache_path = os.path.join(CACHE_DIR, "weekly.parquet")

    if use_cache and os.path.exists(cache_path):
        df = pd.read_parquet(cache_path)
        cached_seasons = df["season"].unique().tolist()
        if set(seasons).issubset(set(cached_seasons)):
            return df[df["season"].isin(seasons)].reset_index(drop=True)

    df = nfl.import_weekly_data(seasons)
    df.to_parquet(cache_path, index=False)
    return df[df["season"].isin(seasons)].reset_index(drop=True)


def build_team_season_stats(seasons: list[int]) -> pd.DataFrame:
    """
    Build comprehensive team-season stats from schedule data.
    Computes per-game averages for each team in each season.
    """
    schedules = fetch_schedules(seasons)

    # Filter to completed games only
    completed = schedules[schedules["result"].notna()].copy()

    # Build stats from the home team perspective
    home_stats = completed.groupby(["season", "home_team"]).agg(
        games_played=("result", "count"),
        total_points_for=("home_score", "sum"),
        total_points_against=("away_score", "sum"),
        wins=("result", lambda x: (x > 0).sum()),
    ).reset_index()
    home_stats.rename(columns={"home_team": "team"}, inplace=True)

    # Build stats from the away team perspective
    away_stats = completed.groupby(["season", "away_team"]).agg(
        games_played=("result", "count"),
        total_points_for=("away_score", "sum"),
        total_points_against=("home_score", "sum"),
        wins=("result", lambda x: (x < 0).sum()),
    ).reset_index()
    away_stats.rename(columns={"away_team": "team"}, inplace=True)

    # Combine home and away
    combined = pd.concat([home_stats, away_stats], ignore_index=True)
    team_stats = combined.groupby(["season", "team"]).agg(
        games_played=("games_played", "sum"),
        total_points_for=("total_points_for", "sum"),
        total_points_against=("total_points_against", "sum"),
        wins=("wins", "sum"),
    ).reset_index()

    # Per-game averages
    team_stats["points_per_game"] = (
        team_stats["total_points_for"] / team_stats["games_played"]
    )
    team_stats["points_allowed_per_game"] = (
        team_stats["total_points_against"] / team_stats["games_played"]
    )
    team_stats["point_diff_per_game"] = (
        team_stats["points_per_game"] - team_stats["points_allowed_per_game"]
    )
    team_stats["win_pct"] = team_stats["wins"] / team_stats["games_played"]

    # Pythagorean win expectation (NFL exponent = 2.37)
    pf = team_stats["total_points_for"]
    pa = team_stats["total_points_against"]
    team_stats["pythagorean_wins"] = pf**2.37 / (pf**2.37 + pa**2.37)

    return team_stats


def build_game_dataset(seasons: list[int]) -> pd.DataFrame:
    """
    Build the full game dataset with outcomes.
    Returns one row per game with home_team, away_team, season, and result.
    """
    schedules = fetch_schedules(seasons)
    completed = schedules[schedules["result"].notna()].copy()

    games = completed[
        ["season", "week", "game_type", "home_team", "away_team",
         "home_score", "away_score", "result"]
    ].copy()

    # 1 = home team wins, 0 = away team wins (drop ties)
    games = games[games["result"] != 0].copy()
    games["home_win"] = (games["result"] > 0).astype(int)

    return games.reset_index(drop=True)


if __name__ == "__main__":
    seasons = list(range(2010, 2025))
    print("Fetching schedules...")
    scheds = fetch_schedules(seasons)
    print(f"  -> {len(scheds)} games across {len(seasons)} seasons")

    print("Building team season stats...")
    stats = build_team_season_stats(seasons)
    print(f"  -> {len(stats)} team-season records")
    print(stats.head())

    print("\nBuilding game dataset...")
    games = build_game_dataset(seasons)
    print(f"  -> {len(games)} games with outcomes")
    print(games.head())
