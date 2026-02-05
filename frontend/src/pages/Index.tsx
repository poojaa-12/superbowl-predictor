import { AnimatedBackground } from '@/components/AnimatedBackground';
import { HeroSection } from '@/components/HeroSection';
import { PredictButton } from '@/components/PredictButton';
import { ProbabilityBar } from '@/components/ProbabilityBar';
import { MascotCelebration } from '@/components/MascotCelebration';
import { FeatureChart } from '@/components/FeatureChart';
import { ModelComparison } from '@/components/ModelComparison';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { usePrediction } from '@/hooks/usePrediction';

function Index() {
  const {
    prediction,
    features,
    isLoading,
    selectedModel,
    predict,
    refetchWithModel,
  } = usePrediction();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />
      
      <main className="relative z-10 container mx-auto py-8 md:py-12">
        <HeroSection />
        
        <PredictButton 
          onClick={predict} 
          isLoading={isLoading} 
          hasPrediction={!!prediction}
        />

        {isLoading && <LoadingSkeleton />}

        {prediction && !isLoading && (
          <>
            <ProbabilityBar prediction={prediction} />
            <MascotCelebration prediction={prediction} />
            
            {prediction.feature_contributions && (
              <FeatureChart features={prediction.feature_contributions} />
            )}
            
            {features && (
              <ModelComparison
                selectedModel={selectedModel}
                onModelChange={refetchWithModel}
                modelMetrics={features.model_comparison}
                isLoading={isLoading}
              />
            )}
            
            <ConfidenceMeter prediction={prediction} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm">
        <p>Super Bowl XLIX Prediction • Seattle Seahawks vs New England Patriots</p>
        <p className="mt-1">Built with Machine Learning</p>
      </footer>
    </div>
  );
}

export default Index;
