import { motion } from 'framer-motion';
import { PredictionResponse } from '@/lib/api';

interface ProbabilityBarProps {
  prediction: PredictionResponse;
}

export function ProbabilityBar({ prediction }: ProbabilityBarProps) {
  const seahawksProb = prediction.team_a.win_prob * 100;
  const patriotsProb = prediction.team_b.win_prob * 100;

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Team Labels */}
      <div className="flex justify-between items-end mb-4">
        <motion.div
          className="text-left"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-muted-foreground">Seattle</p>
          <p className="text-2xl md:text-3xl font-bold text-seahawks-primary">
            Seahawks {seahawksProb.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          className="text-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-muted-foreground">New England</p>
          <p className="text-2xl md:text-3xl font-bold text-patriots-primary">
            {patriotsProb.toFixed(1)}% Patriots
          </p>
        </motion.div>
      </div>

      {/* Probability Bar */}
      <div className="relative h-14 md:h-16 rounded-full overflow-hidden bg-secondary/50 shadow-inner">
        {/* Seahawks Side */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-l-full"
          style={{ backgroundColor: 'hsl(93 65% 45%)' }}
          initial={{ width: '50%' }}
          animate={{ width: `${seahawksProb}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Patriots Side */}
        <motion.div
          className="absolute right-0 top-0 h-full rounded-r-full"
          style={{ backgroundColor: 'hsl(355 88% 41%)' }}
          initial={{ width: '50%' }}
          animate={{ width: `${patriotsProb}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Center Marker */}
        <motion.div
          className="absolute top-0 h-full flex flex-col items-center justify-end"
          initial={{ left: '50%' }}
          animate={{ left: `${seahawksProb}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
          <div className="w-1 h-full bg-white/80" />
        </motion.div>
      </div>

      {/* Percentage Labels on Bar */}
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </motion.section>
  );
}
