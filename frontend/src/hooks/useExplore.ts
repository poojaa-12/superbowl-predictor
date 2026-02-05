import { useState, useEffect, useCallback } from 'react';
import {
  TeamHistoryResponse,
  FeatureDistributionsResponse,
  CorrelationMatrixResponse,
  HomeWinRatesResponse,
  MatchupComparisonResponse,
  fetchTeamHistory,
  fetchFeatureDistributions,
  fetchCorrelationMatrix,
  fetchHomeWinRates,
  fetchMatchupComparison,
  mockTeamHistory,
  mockFeatureDistributions,
  mockCorrelationMatrix,
  mockHomeWinRates,
  mockMatchupComparison,
} from '@/lib/api';

interface UseExploreReturn {
  teamHistory: TeamHistoryResponse | null;
  featureDistributions: FeatureDistributionsResponse | null;
  correlationMatrix: CorrelationMatrixResponse | null;
  homeWinRates: HomeWinRatesResponse | null;
  matchupComparison: MatchupComparisonResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExplore(): UseExploreReturn {
  const [teamHistory, setTeamHistory] = useState<TeamHistoryResponse | null>(null);
  const [featureDistributions, setFeatureDistributions] = useState<FeatureDistributionsResponse | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrixResponse | null>(null);
  const [homeWinRates, setHomeWinRates] = useState<HomeWinRatesResponse | null>(null);
  const [matchupComparison, setMatchupComparison] = useState<MatchupComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [history, distributions, correlation, winRates, comparison] = await Promise.all([
        fetchTeamHistory('SEA', 'NE'),
        fetchFeatureDistributions(),
        fetchCorrelationMatrix(),
        fetchHomeWinRates(),
        fetchMatchupComparison('SEA', 'NE', 2014),
      ]);

      setTeamHistory(history);
      setFeatureDistributions(distributions);
      setCorrelationMatrix(correlation);
      setHomeWinRates(winRates);
      setMatchupComparison(comparison);
    } catch (err) {
      console.warn('EDA API not available, using mock data:', err);
      setTeamHistory(mockTeamHistory);
      setFeatureDistributions(mockFeatureDistributions);
      setCorrelationMatrix(mockCorrelationMatrix);
      setHomeWinRates(mockHomeWinRates);
      setMatchupComparison(mockMatchupComparison);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    teamHistory,
    featureDistributions,
    correlationMatrix,
    homeWinRates,
    matchupComparison,
    isLoading,
    error,
    refetch: fetchAll,
  };
}
