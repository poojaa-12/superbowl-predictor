import { AnimatedBackground } from '@/components/AnimatedBackground';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { HistoricalComparison } from '@/components/eda/HistoricalComparison';
import { FeatureDistributions } from '@/components/eda/FeatureDistributions';
import { CorrelationMatrix } from '@/components/eda/CorrelationMatrix';
import { HomeWinRates } from '@/components/eda/HomeWinRates';
import { MatchupComparison } from '@/components/eda/MatchupComparison';
import { useExplore } from '@/hooks/useExplore';
import { motion } from 'framer-motion';

function Explore() {
  const {
    teamHistory,
    featureDistributions,
    correlationMatrix,
    homeWinRates,
    matchupComparison,
    isLoading,
  } = useExplore();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />

      <main className="relative z-10 container mx-auto py-8 md:py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            EXPLORE THE{' '}
            <span className="bg-gradient-to-r from-[#69BE28] via-[#FFD700] to-[#C60C30] bg-clip-text text-transparent">
              DATA
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Dive into the NFL data powering the Super Bowl prediction model.
            Historical trends, feature distributions, correlations, and head-to-head stats.
          </p>
        </motion.div>

        {isLoading && (
          <div className="space-y-6">
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            {teamHistory && <HistoricalComparison data={teamHistory} />}
            {matchupComparison && <MatchupComparison data={matchupComparison} />}
            {featureDistributions && <FeatureDistributions data={featureDistributions} />}
            {correlationMatrix && <CorrelationMatrix data={correlationMatrix} />}
            {homeWinRates && <HomeWinRates data={homeWinRates} />}
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm">
        <p>Super Bowl XLIX Prediction • Seattle Seahawks vs New England Patriots</p>
        <p className="mt-1">Built with Machine Learning</p>
      </footer>
    </div>
  );
}

export default Explore;
