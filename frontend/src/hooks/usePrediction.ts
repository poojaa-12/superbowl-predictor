import { useState, useCallback } from 'react';
import { 
  PredictionResponse, 
  FeaturesResponse, 
  ModelType, 
  fetchPrediction, 
  fetchFeatures,
  mockPrediction,
  mockFeatures
} from '@/lib/api';

interface UsePredictionReturn {
  prediction: PredictionResponse | null;
  features: FeaturesResponse | null;
  isLoading: boolean;
  error: string | null;
  selectedModel: ModelType;
  predict: () => Promise<void>;
  setSelectedModel: (model: ModelType) => void;
  refetchWithModel: (model: ModelType) => Promise<void>;
}

export function usePrediction(): UsePredictionReturn {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [features, setFeatures] = useState<FeaturesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('logistic_regression');

  const predict = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [predictionData, featuresData] = await Promise.all([
        fetchPrediction('SEA', 'NE', 2014, selectedModel),
        fetchFeatures(),
      ]);
      setPrediction(predictionData);
      setFeatures(featuresData);
    } catch (err) {
      console.warn('API not available, using mock data:', err);
      // Use mock data when API is not available
      setPrediction(mockPrediction);
      setFeatures(mockFeatures);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel]);

  const refetchWithModel = useCallback(async (model: ModelType) => {
    setSelectedModel(model);
    setIsLoading(true);
    setError(null);

    try {
      const predictionData = await fetchPrediction('SEA', 'NE', 2014, model);
      setPrediction(predictionData);
    } catch (err) {
      console.warn('API not available, using mock data:', err);
      // Slightly modify mock data based on model for demo
      const modifiedPrediction = {
        ...mockPrediction,
        team_a: { ...mockPrediction.team_a, win_prob: model === 'random_forest' ? 0.456 : 0.423 },
        team_b: { ...mockPrediction.team_b, win_prob: model === 'random_forest' ? 0.544 : 0.577 },
      };
      setPrediction(modifiedPrediction);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    prediction,
    features,
    isLoading,
    error,
    selectedModel,
    predict,
    setSelectedModel,
    refetchWithModel,
  };
}
