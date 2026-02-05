import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { PredictionResponse } from '@/lib/api';

interface MascotCelebrationProps {
  prediction: PredictionResponse;
}

export function MascotCelebration({ prediction }: MascotCelebrationProps) {
  const winner = prediction.team_a.win_prob > prediction.team_b.win_prob ? 'SEA' : 'NE';
  const isSeahawksWinner = winner === 'SEA';

  // Confetti particles
  const confettiColors = isSeahawksWinner 
    ? ['#69BE28', '#002244', '#A5ACAF']
    : ['#C60C30', '#002244', '#B0B7BC'];

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="grid grid-cols-2 gap-4 md:gap-8">
        {/* Seahawks Side */}
        <motion.div
          className={`relative p-6 md:p-8 rounded-2xl glass text-center ${
            !isSeahawksWinner ? 'opacity-50 grayscale' : ''
          }`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: isSeahawksWinner ? 1 : 0.5 }}
          transition={{ delay: 0.9 }}
        >
          {isSeahawksWinner && (
            <>
              {/* Confetti */}
              {confettiColors.map((color, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ 
                    top: '50%', 
                    left: '50%', 
                    scale: 0 
                  }}
                  animate={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                    scale: [0, 1, 0.5],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: 1 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              ))}

              {/* Winner Badge */}
              <motion.div
                className="absolute -top-4 left-1/2 -translate-x-1/2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring', bounce: 0.5 }}
              >
                <div className="px-4 py-1 rounded-full gradient-gold text-background text-sm font-bold">
                  WINNER
                </div>
              </motion.div>
            </>
          )}

          <motion.div
            animate={isSeahawksWinner ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <Trophy 
              className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 ${
                isSeahawksWinner ? 'text-gold' : 'text-muted-foreground'
              }`}
            />
          </motion.div>

          <h3 className="text-lg md:text-xl font-bold text-seahawks-primary">
            Seahawks
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Seattle</p>
        </motion.div>

        {/* Patriots Side */}
        <motion.div
          className={`relative p-6 md:p-8 rounded-2xl glass text-center ${
            isSeahawksWinner ? 'opacity-50 grayscale' : ''
          }`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: !isSeahawksWinner ? 1 : 0.5 }}
          transition={{ delay: 0.9 }}
        >
          {!isSeahawksWinner && (
            <>
              {/* Confetti */}
              {confettiColors.map((color, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ 
                    top: '50%', 
                    left: '50%', 
                    scale: 0 
                  }}
                  animate={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                    scale: [0, 1, 0.5],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: 1 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              ))}

              {/* Winner Badge */}
              <motion.div
                className="absolute -top-4 left-1/2 -translate-x-1/2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring', bounce: 0.5 }}
              >
                <div className="px-4 py-1 rounded-full gradient-gold text-background text-sm font-bold">
                  WINNER
                </div>
              </motion.div>
            </>
          )}

          <motion.div
            animate={!isSeahawksWinner ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <Trophy 
              className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 ${
                !isSeahawksWinner ? 'text-gold' : 'text-muted-foreground'
              }`}
            />
          </motion.div>

          <h3 className="text-lg md:text-xl font-bold text-patriots-primary">
            Patriots
          </h3>
          <p className="text-sm text-muted-foreground mt-1">New England</p>
        </motion.div>
      </div>
    </motion.section>
  );
}
