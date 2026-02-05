import { motion } from 'framer-motion';
import { PredictionResponse } from '@/lib/api';

interface ConfidenceMeterProps {
  prediction: PredictionResponse;
}

export function ConfidenceMeter({ prediction }: ConfidenceMeterProps) {
  const winner = prediction.team_a.win_prob > prediction.team_b.win_prob ? 'SEA' : 'NE';
  const winningProb = Math.max(prediction.team_a.win_prob, prediction.team_b.win_prob);
  
  // Convert to confidence: 50% = 0 confidence, 100% = 100% confidence
  const confidence = ((winningProb - 0.5) / 0.5) * 100;
  
  // Arc properties
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const fillLength = (confidence / 100) * circumference;

  const arcColor = winner === 'SEA' 
    ? 'hsl(93 65% 45%)' 
    : 'hsl(355 88% 41%)';

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <motion.h2
        className="text-xl md:text-2xl font-bold text-center mb-8 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        Model Confidence
      </motion.h2>

      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.7, type: 'spring' }}
      >
        <svg 
          width={size} 
          height={size / 2 + 20} 
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="hsl(217 32.6% 17.5%)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - fillLength }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 1.8 }}
            style={{
              filter: `drop-shadow(0 0 10px ${arcColor})`,
            }}
          />

          {/* Center labels */}
          <text
            x="10"
            y={size / 2 + 16}
            fill="hsl(215 16% 60%)"
            fontSize="12"
          >
            50%
          </text>
          <text
            x={size - 30}
            y={size / 2 + 16}
            fill="hsl(215 16% 60%)"
            fontSize="12"
          >
            100%
          </text>
        </svg>

        {/* Confidence Value */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="text-4xl md:text-5xl font-bold text-white">
            {confidence.toFixed(0)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Confidence
          </div>
        </motion.div>
      </motion.div>

      {/* Confidence interpretation */}
      <motion.p
        className="text-center text-muted-foreground mt-6 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
      >
        {confidence >= 30 
          ? `The model is fairly confident that the ${winner === 'SEA' ? 'Seahawks' : 'Patriots'} will win.`
          : 'This is a close matchup. The model sees it as nearly even.'}
      </motion.p>
    </motion.section>
  );
}
