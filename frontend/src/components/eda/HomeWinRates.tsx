import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { HomeWinRatesResponse } from '@/lib/api';

interface Props {
  data: HomeWinRatesResponse;
}

const GAME_TYPE_LABELS: Record<string, string> = {
  REG: 'Regular Season',
  WC: 'Wild Card',
  DIV: 'Divisional',
  CON: 'Conference',
  SB: 'Super Bowl',
};

const BAR_COLORS = ['#002244', '#69BE28', '#C60C30', '#FFD700', '#B0B7BC'];

export function HomeWinRates({ data }: Props) {
  const chartData = data.game_types.map((gt) => ({
    ...gt,
    label: GAME_TYPE_LABELS[gt.game_type] || gt.game_type,
    display_rate: Math.round(gt.home_win_rate * 1000) / 10,
    count_label: `n=${gt.count}`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Home Win Rate by Game Type</h2>
      <p className="text-gray-400 text-sm mb-6">
        Home field advantage varies across regular season vs playoff games
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#d1d5db', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 0.8]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10,10,26,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Home Win Rate']}
          />
          <ReferenceLine
            y={0.5}
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="6 3"
            label={{ value: '50%', fill: '#9ca3af', fontSize: 11, position: 'right' }}
          />
          <Bar dataKey="home_win_rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
            <LabelList
              dataKey="count_label"
              position="top"
              fill="#9ca3af"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
