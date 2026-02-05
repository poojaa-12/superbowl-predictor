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
