import { motion } from 'framer-motion';
import { MatchupComparisonResponse } from '@/lib/api';

interface Props {
  data: MatchupComparisonResponse;
}

export function MatchupComparison({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-2">
        {data.season} Season — Head to Head
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        {data.team_a.name} vs {data.team_b.name} stat comparison
      </p>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Stat
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#69BE28' }}>
                {data.team_a.name}
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#C60C30' }}>
                {data.team_b.name}
              </th>
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Edge
              </th>
            </tr>
          </thead>
          <tbody>
            {data.comparison.map((row, i) => {
              const isSeaAdvantage = row.advantage === data.team_a.abbr;
              return (
                <tr
                  key={row.stat}
                  className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="py-3 px-4 text-sm text-gray-300 font-medium">
                    {row.stat}
                  </td>
                  <td
                    className="py-3 px-4 text-center text-sm font-mono font-semibold"
                    style={{ color: isSeaAdvantage ? '#69BE28' : '#9ca3af' }}
                  >
                    {formatStat(row.stat, row.team_a_value)}
                  </td>
                  <td
                    className="py-3 px-4 text-center text-sm font-mono font-semibold"
                    style={{ color: !isSeaAdvantage ? '#C60C30' : '#9ca3af' }}
                  >
                    {formatStat(row.stat, row.team_b_value)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: isSeaAdvantage ? 'rgba(105,190,40,0.15)' : 'rgba(198,12,48,0.15)',
                        color: isSeaAdvantage ? '#69BE28' : '#C60C30',
                      }}
                    >
                      {row.advantage}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual bar comparison */}
      <div className="mt-6 space-y-3">
        {data.comparison.map((row) => {
          const total = row.team_a_value + row.team_b_value;
          const pctA = total > 0 ? (row.team_a_value / total) * 100 : 50;
          return (
            <div key={row.stat}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{row.stat}</span>
                <span>{formatStat(row.stat, row.team_a_value)} vs {formatStat(row.stat, row.team_b_value)}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                <div
                  className="transition-all duration-700"
                  style={{ width: `${pctA}%`, backgroundColor: '#69BE28' }}
                />
                <div
                  className="transition-all duration-700"
                  style={{ width: `${100 - pctA}%`, backgroundColor: '#C60C30' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function formatStat(stat: string, value: number): string {
  if (stat.toLowerCase().includes('pct') || stat.toLowerCase().includes('win')) {
    if (value <= 1) return (value * 100).toFixed(1) + '%';
  }
  return value.toFixed(1);
}
