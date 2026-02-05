import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FeatureDistributionsResponse } from '@/lib/api';

interface Props {
  data: FeatureDistributionsResponse;
}

export function FeatureDistributions({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Feature Distributions</h2>
      <p className="text-gray-400 text-sm mb-1">
        How each feature's differential splits between home wins and losses
      </p>
      <p className="text-gray-500 text-xs mb-6">
        {data.total_matchups.toLocaleString()} total matchups | Home win rate: {(data.home_win_rate * 100).toFixed(1)}%
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.distributions.map((dist) => {
          const chartData = dist.bins.map((bin, i) => ({
            bin: bin.toFixed(1),
            'Home Win': dist.home_win[i],
            'Home Loss': dist.home_loss[i],
          }));

          return (
            <div key={dist.feature} className="bg-white/5 rounded-xl p-3">
              <h3 className="text-xs font-semibold text-gray-300 mb-2 truncate">{dist.label}</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="bin"
                    tick={{ fill: '#9ca3af', fontSize: 8 }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,10,26,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="Home Win" fill="#69BE28" opacity={0.7} />
                  <Bar dataKey="Home Loss" fill="#C60C30" opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 justify-center text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#69BE28] opacity-70" /> Home Win
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#C60C30] opacity-70" /> Home Loss
        </span>
      </div>
    </motion.div>
  );
}
