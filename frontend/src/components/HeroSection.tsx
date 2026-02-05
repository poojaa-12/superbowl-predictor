import { motion } from 'framer-motion';

const SEAHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png';
const PATRIOTS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png';

export function HeroSection() {
  return (
    <motion.section 
      className="text-center py-8 md:py-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title */}
      <motion.h1 
        className="text-4xl md:text-6xl font-bold uppercase tracking-wider text-white text-glow-gold mb-2"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Super Bowl Predictor
      </motion.h1>
      
      <motion.p 
        className="text-muted-foreground text-sm md:text-base mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Powered by Machine Learning
      </motion.p>

      {/* Team Logos */}
      <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-16">
        {/* Seahawks Logo */}
        <motion.div
          className="relative"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background: 'linear-gradient(135deg, hsl(214 100% 13%) 0%, hsl(93 65% 45%) 100%)',
              transform: 'scale(1.3)',
            }}
          />
          <motion.img
            src={SEAHAWKS_LOGO}
            alt="Seattle Seahawks"
            className="relative w-24 h-24 md:w-32 md:h-32 object-contain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* VS Badge */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.5, type: 'spring' }}
        >
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{
              background: 'radial-gradient(circle, hsl(51 100% 50%) 0%, transparent 70%)',
              transform: 'scale(2)',
            }}
          />
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full gradient-gold flex items-center justify-center shadow-lg">
            <span className="text-xl md:text-2xl font-black text-background">VS</span>
          </div>
        </motion.div>

        {/* Patriots Logo */}
        <motion.div
          className="relative"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background: 'linear-gradient(135deg, hsl(214 100% 13%) 0%, hsl(355 88% 41%) 100%)',
              transform: 'scale(1.3)',
            }}
          />
          <motion.img
            src={PATRIOTS_LOGO}
            alt="New England Patriots"
            className="relative w-24 h-24 md:w-32 md:h-32 object-contain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
