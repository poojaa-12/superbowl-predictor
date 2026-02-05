// API configuration - configurable via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface TeamPrediction {
  abbr: string;
  name: string;
  win_prob: number;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  favors: 'SEA' | 'NE';
}

export interface PredictionResponse {
  team_a: TeamPrediction;
  team_b: TeamPrediction;
  confidence_interval: [number, number];
  feature_contributions: FeatureContribution[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  selected: boolean;
}

export interface ModelMetrics {
  model_name: string;
  accuracy: number;
  accuracy_std: number;
  log_loss: number;
  log_loss_std: number;
  roc_auc: number;
  roc_auc_std: number;
}

export interface FeaturesResponse {
  selected_features: string[];
  all_importances: FeatureImportance[];
  model_comparison: ModelMetrics[];
}

export interface TeamStats {
  team: string;
  season: number;
  points_per_game: number;
  points_allowed: number;
  point_differential: number;
  win_pct: number;
  pythagorean_wins: number;
  strength_of_schedule: number;
  average_margin: number;
}

export type ModelType = 'logistic_regression' | 'random_forest';

export async function fetchPrediction(
  teamA: string = 'SEA',
  teamB: string = 'NE',
  season: number = 2014,
  model: ModelType = 'logistic_regression'
): Promise<PredictionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/predict?team_a=${teamA}&team_b=${teamB}&season=${season}&model=${model}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch prediction: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchFeatures(): Promise<FeaturesResponse> {
  const response = await fetch(`${API_BASE_URL}/features`);
  if (!response.ok) {
    throw new Error(`Failed to fetch features: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTeamStats(team: string, season: number = 2014): Promise<TeamStats> {
  const response = await fetch(`${API_BASE_URL}/stats?team=${team}&season=${season}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch team stats: ${response.statusText}`);
  }
  return response.json();
}

// --- EDA Types ---

export interface TeamSeasonRecord {
  season: number;
  win_pct: number;
  points_per_game: number;
  points_allowed_per_game: number;
  point_diff_per_game: number;
}

export interface TeamHistoryEntry {
  abbr: string;
  name: string;
  seasons: TeamSeasonRecord[];
}

export interface TeamHistoryResponse {
  team_a: TeamHistoryEntry;
  team_b: TeamHistoryEntry;
}

export interface FeatureDistribution {
  feature: string;
  label: string;
  bins: number[];
  home_win: number[];
  home_loss: number[];
}

export interface FeatureDistributionsResponse {
  total_matchups: number;
  home_win_rate: number;
  distributions: FeatureDistribution[];
}

export interface CorrelationMatrixResponse {
  features: string[];
  labels: string[];
  matrix: number[][];
  high_pairs: { feat_a: string; feat_b: string; r: number }[];
}

export interface GameTypeWinRate {
  game_type: string;
  count: number;
  home_win_rate: number;
}

export interface HomeWinRatesResponse {
  game_types: GameTypeWinRate[];
}

export interface MatchupStat {
  stat: string;
  team_a_value: number;
  team_b_value: number;
  advantage: string;
}

export interface MatchupComparisonResponse {
  team_a: { abbr: string; name: string };
  team_b: { abbr: string; name: string };
  season: number;
  comparison: MatchupStat[];
}

// --- EDA Fetch Functions ---

export async function fetchTeamHistory(
  teamA: string = 'SEA',
  teamB: string = 'NE'
): Promise<TeamHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/eda/team-history?team_a=${teamA}&team_b=${teamB}`
  );
  if (!response.ok) throw new Error(`Failed to fetch team history: ${response.statusText}`);
  return response.json();
}

export async function fetchFeatureDistributions(): Promise<FeatureDistributionsResponse> {
  const response = await fetch(`${API_BASE_URL}/eda/feature-distributions`);
  if (!response.ok) throw new Error(`Failed to fetch distributions: ${response.statusText}`);
  return response.json();
}

export async function fetchCorrelationMatrix(): Promise<CorrelationMatrixResponse> {
  const response = await fetch(`${API_BASE_URL}/eda/correlation-matrix`);
  if (!response.ok) throw new Error(`Failed to fetch correlation matrix: ${response.statusText}`);
  return response.json();
}

export async function fetchHomeWinRates(): Promise<HomeWinRatesResponse> {
  const response = await fetch(`${API_BASE_URL}/eda/home-win-rates`);
  if (!response.ok) throw new Error(`Failed to fetch home win rates: ${response.statusText}`);
  return response.json();
}

export async function fetchMatchupComparison(
  teamA: string = 'SEA',
  teamB: string = 'NE',
  season: number = 2014
): Promise<MatchupComparisonResponse> {
  const response = await fetch(
    `${API_BASE_URL}/eda/matchup-comparison?team_a=${teamA}&team_b=${teamB}&season=${season}`
  );
  if (!response.ok) throw new Error(`Failed to fetch matchup comparison: ${response.statusText}`);
  return response.json();
}

// --- Mock Data ---

// Mock data for development/demo when API is not available
export const mockPrediction: PredictionResponse = {
  team_a: { abbr: 'SEA', name: 'Seattle Seahawks', win_prob: 0.423 },
  team_b: { abbr: 'NE', name: 'New England Patriots', win_prob: 0.577 },
  confidence_interval: [0.52, 0.63],
  feature_contributions: [
    { feature: 'Points Per Game', value: 2.3, favors: 'NE' },
    { feature: 'Points Allowed', value: -1.8, favors: 'SEA' },
    { feature: 'Point Differential', value: 1.5, favors: 'NE' },
    { feature: 'Win %', value: 0.8, favors: 'NE' },
    { feature: 'Pythagorean Wins', value: -0.5, favors: 'SEA' },
    { feature: 'Strength of Schedule', value: 1.2, favors: 'NE' },
    { feature: 'Average Margin', value: -0.3, favors: 'SEA' },
  ],
};

export const mockFeatures: FeaturesResponse = {
  selected_features: ['points_per_game', 'points_allowed', 'point_differential', 'win_pct', 'pythagorean_wins', 'strength_of_schedule', 'average_margin'],
  all_importances: [
    { feature: 'Points Per Game', importance: 0.18, selected: true },
    { feature: 'Points Allowed', importance: 0.16, selected: true },
    { feature: 'Point Differential', importance: 0.15, selected: true },
    { feature: 'Win %', importance: 0.14, selected: true },
    { feature: 'Pythagorean Wins', importance: 0.13, selected: true },
    { feature: 'Strength of Schedule', importance: 0.12, selected: true },
    { feature: 'Average Margin', importance: 0.12, selected: true },
  ],
  model_comparison: [
    { model_name: 'Logistic Regression', accuracy: 0.682, accuracy_std: 0.045, log_loss: 0.584, log_loss_std: 0.032, roc_auc: 0.731, roc_auc_std: 0.038 },
    { model_name: 'Random Forest', accuracy: 0.654, accuracy_std: 0.052, log_loss: 0.612, log_loss_std: 0.041, roc_auc: 0.708, roc_auc_std: 0.044 },
  ],
};

// --- EDA Mock Data ---

const generateSeasons = (baseWinPct: number, basePPG: number, basePAG: number): TeamSeasonRecord[] =>
  Array.from({ length: 15 }, (_, i) => ({
    season: 2010 + i,
    win_pct: Math.round((baseWinPct + (Math.random() - 0.5) * 0.3) * 1000) / 1000,
    points_per_game: Math.round((basePPG + (Math.random() - 0.5) * 6) * 10) / 10,
    points_allowed_per_game: Math.round((basePAG + (Math.random() - 0.5) * 6) * 10) / 10,
    point_diff_per_game: Math.round(((basePPG - basePAG) + (Math.random() - 0.5) * 8) * 10) / 10,
  }));

export const mockTeamHistory: TeamHistoryResponse = {
  team_a: { abbr: 'SEA', name: 'Seattle Seahawks', seasons: generateSeasons(0.58, 23.5, 19.8) },
  team_b: { abbr: 'NE', name: 'New England Patriots', seasons: generateSeasons(0.72, 27.2, 19.5) },
};

export const mockFeatureDistributions: FeatureDistributionsResponse = {
  total_matchups: 4200,
  home_win_rate: 0.572,
  distributions: [
    'Points Per Game', 'Points Allowed Per Game', 'Point Diff Per Game', 'Win Pct',
    'Pythagorean Wins', 'Strength Of Schedule', 'Avg Margin', 'Is Home',
  ].map((label) => ({
    feature: label.toLowerCase().replace(/ /g, '_') + '_diff',
    label,
    bins: Array.from({ length: 20 }, (_, i) => -10 + i),
    home_win: Array.from({ length: 20 }, () => Math.round(Math.random() * 0.15 * 10000) / 10000),
    home_loss: Array.from({ length: 20 }, () => Math.round(Math.random() * 0.12 * 10000) / 10000),
  })),
};

export const mockCorrelationMatrix: CorrelationMatrixResponse = {
  features: ['points_per_game_diff', 'points_allowed_per_game_diff', 'point_diff_per_game_diff', 'win_pct_diff', 'pythagorean_wins_diff', 'strength_of_schedule_diff', 'avg_margin_diff', 'is_home'],
  labels: ['Points Per Game', 'Points Allowed', 'Point Diff', 'Win %', 'Pythagorean Wins', 'Strength Of Schedule', 'Avg Margin', 'Is Home'],
  matrix: [
    [1.0, -0.12, 0.78, 0.45, 0.52, 0.18, 0.71, 0.02],
    [-0.12, 1.0, -0.73, -0.38, -0.45, -0.11, -0.65, -0.01],
    [0.78, -0.73, 1.0, 0.55, 0.64, 0.19, 0.92, 0.02],
    [0.45, -0.38, 0.55, 1.0, 0.88, 0.32, 0.51, 0.01],
    [0.52, -0.45, 0.64, 0.88, 1.0, 0.28, 0.59, 0.01],
    [0.18, -0.11, 0.19, 0.32, 0.28, 1.0, 0.17, 0.0],
    [0.71, -0.65, 0.92, 0.51, 0.59, 0.17, 1.0, 0.02],
    [0.02, -0.01, 0.02, 0.01, 0.01, 0.0, 0.02, 1.0],
  ],
  high_pairs: [
    { feat_a: 'Point Diff', feat_b: 'Avg Margin', r: 0.92 },
    { feat_a: 'Win %', feat_b: 'Pythagorean Wins', r: 0.88 },
    { feat_a: 'Points Per Game', feat_b: 'Point Diff', r: 0.78 },
    { feat_a: 'Points Allowed', feat_b: 'Point Diff', r: -0.73 },
    { feat_a: 'Points Per Game', feat_b: 'Avg Margin', r: 0.71 },
  ],
};

export const mockHomeWinRates: HomeWinRatesResponse = {
  game_types: [
    { game_type: 'REG', count: 3840, home_win_rate: 0.572 },
    { game_type: 'WC', count: 96, home_win_rate: 0.625 },
    { game_type: 'DIV', count: 96, home_win_rate: 0.646 },
    { game_type: 'CON', count: 48, home_win_rate: 0.583 },
    { game_type: 'SB', count: 15, home_win_rate: 0.467 },
  ],
};

export const mockMatchupComparison: MatchupComparisonResponse = {
  team_a: { abbr: 'SEA', name: 'Seattle Seahawks' },
  team_b: { abbr: 'NE', name: 'New England Patriots' },
  season: 2014,
  comparison: [
    { stat: 'Points Per Game', team_a_value: 24.2, team_b_value: 29.2, advantage: 'NE' },
    { stat: 'Points Allowed Per Game', team_a_value: 15.9, team_b_value: 19.6, advantage: 'SEA' },
    { stat: 'Point Diff Per Game', team_a_value: 8.3, team_b_value: 9.6, advantage: 'NE' },
    { stat: 'Win Pct', team_a_value: 0.75, team_b_value: 0.75, advantage: 'SEA' },
    { stat: 'Pythagorean Wins', team_a_value: 0.78, team_b_value: 0.76, advantage: 'SEA' },
  ],
};
