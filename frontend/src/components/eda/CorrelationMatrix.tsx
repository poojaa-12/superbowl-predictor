import { motion } from 'framer-motion';
import { CorrelationMatrixResponse } from '@/lib/api';

interface Props {
  data: CorrelationMatrixResponse;
}

function getCorrelationColor(r: number): string {
  const abs = Math.abs(r);
  if (r > 0) {
    // Blue scale for positive
    const intensity = Math.round(abs * 200);
    return `rgba(59, 130, 246, ${abs * 0.8})`;
  } else {
    // Red scale for negative
    return `rgba(239, 68, 68, ${abs * 0.8})`;
  }
}

function getTextColor(r: number): string {
  return Math.abs(r) > 0.5 ? 'white' : '#d1d5db';
}

export function CorrelationMatrix({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Feature Correlation Matrix</h2>
      <p className="text-gray-400 text-sm mb-6">
        Blue = positive correlation, Red = negative. Highlighted pairs have |r| &gt; 0.7
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1" />
              {data.labels.map((label) => (
                <th
                  key={label}
                  className="p-1 text-gray-400 font-medium whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '100px' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, i) => (
              <tr key={data.labels[i]}>
                <td className="p-1 text-gray-400 font-medium whitespace-nowrap text-right pr-2">
                  {data.labels[i]}
                </td>
                {row.map((val, j) => {
                  const isHighPair = data.high_pairs.some(
                    (p) =>
                      (p.feat_a === data.labels[i] && p.feat_b === data.labels[j]) ||
                      (p.feat_a === data.labels[j] && p.feat_b === data.labels[i])
                  );
                  return (
                    <td
                      key={j}
                      className={`p-1 text-center font-mono ${isHighPair && i !== j ? 'ring-1 ring-yellow-400/60' : ''}`}
                      style={{
                        backgroundColor: i === j ? 'rgba(255,255,255,0.1)' : getCorrelationColor(val),
                        color: i === j ? '#9ca3af' : getTextColor(val),
                        minWidth: '42px',
                        borderRadius: '4px',
                      }}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.high_pairs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-yellow-400/80 mb-2">
            Highly Correlated Pairs (|r| &gt; 0.7)
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.high_pairs.map((pair) => (
              <span
                key={`${pair.feat_a}-${pair.feat_b}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-300 text-xs border border-yellow-400/20"
              >
                {pair.feat_a} ↔ {pair.feat_b}: <strong>r={pair.r.toFixed(2)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
