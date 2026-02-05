import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PredictButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasPrediction: boolean;
}

export function PredictButton({ onClick, isLoading, hasPrediction }: PredictButtonProps) {
  return (
    <motion.div 
      className="flex justify-center py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <motion.button
        onClick={onClick}
        disabled={isLoading}
        className="relative px-8 py-4 md:px-12 md:py-5 rounded-full font-bold text-lg md:text-xl uppercase tracking-wide text-background gradient-gold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={!hasPrediction && !isLoading ? {
          boxShadow: [
            '0 0 20px hsl(51 100% 50% / 0.4)',
            '0 0 40px hsl(51 100% 50% / 0.6)',
            '0 0 20px hsl(51 100% 50% / 0.4)',
          ],
        } : {}}
        transition={!hasPrediction && !isLoading ? {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </span>
        ) : hasPrediction ? (
          'Predict Again'
        ) : (
          'Predict The Winner'
        )}
      </motion.button>
    </motion.div>
  );
}
