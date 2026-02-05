import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TeamHistoryResponse } from '@/lib/api';

interface Props {
  data: TeamHistoryResponse;
}

const METRICS = [
  { key: 'win_pct', label: 'Win Percentage', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'points_per_game', label: 'Points Per Game', format: (v: number) => v.toFixed(1) },
  { key: 'points_allowed_per_game', label: 'Points Allowed Per Game', format: (v: number) => v.toFixed(1) },
  { key: 'point_diff_per_game', label: 'Point Differential', format: (v: number) => v.toFixed(1) },
] as const;

export function HistoricalComparison({ data }: Props) {
  // Merge both teams' data by season
  const chartData = data.team_a.seasons.map((aSeason) => {
    const bSeason = data.team_b.seasons.find((b) => b.season === aSeason.season);
    return {
      season: aSeason.season,
      sea_win_pct: aSeason.win_pct,
      sea_points_per_game: aSeason.points_per_game,
      sea_points_allowed_per_game: aSeason.points_allowed_per_game,
      sea_point_diff_per_game: aSeason.point_diff_per_game,
      ne_win_pct: bSeason?.win_pct ?? 0,
      ne_points_per_game: bSeason?.points_per_game ?? 0,
      ne_points_allowed_per_game: bSeason?.points_allowed_per_game ?? 0,
      ne_point_diff_per_game: bSeason?.point_diff_per_game ?? 0,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Historical Comparison</h2>
      <p className="text-gray-400 text-sm mb-6">
        {data.team_a.name} vs {data.team_b.name} — Season by Season (2010–2024)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {METRICS.map((metric) => (
          <div key={metric.key} className="bg-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">{metric.label}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="season"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={metric.format}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,26,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  formatter={(value: number) => metric.format(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={`sea_${metric.key}`}
                  stroke="#69BE28"
                  strokeWidth={2}
                  dot={{ fill: '#69BE28', r: 3 }}
                  name="Seahawks"
                />
                <Line
                  type="monotone"
                  dataKey={`ne_${metric.key}`}
                  stroke="#C60C30"
                  strokeWidth={2}
                  dot={{ fill: '#C60C30', r: 3 }}
                  name="Patriots"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
