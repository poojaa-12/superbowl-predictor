import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Probability Bar Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse ml-auto" />
            <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-14 w-full bg-white/10 rounded-full animate-pulse" />
      </div>

      {/* Mascot Skeleton */}
      <div className="grid grid-cols-2 gap-8">
        <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
      </div>

      {/* Chart Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse mx-auto" />
        <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </motion.div>
  );
}
