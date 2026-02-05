import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { FeatureContribution } from '@/lib/api';

interface FeatureChartProps {
  features: FeatureContribution[];
}

export function FeatureChart({ features }: FeatureChartProps) {
  // Transform data for diverging bar chart
  const chartData = features.map((f) => ({
    name: f.feature,
    value: f.favors === 'SEA' ? -Math.abs(f.value) : Math.abs(f.value),
    favors: f.favors,
    displayValue: Math.abs(f.value).toFixed(1),
  }));

  const SEAHAWKS_COLOR = '#69BE28';
  const PATRIOTS_COLOR = '#C60C30';

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <motion.h2
        className="text-xl md:text-2xl font-bold text-center mb-6 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        What The Model Sees
      </motion.h2>

      <motion.div
        className="glass rounded-2xl p-4 md:p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {/* Legend */}
        <div className="flex justify-center gap-8 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: SEAHAWKS_COLOR }} />
            <span className="text-muted-foreground">Favors Seahawks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: PATRIOTS_COLOR }} />
            <span className="text-muted-foreground">Favors Patriots</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 100, bottom: 10 }}
          >
            <XAxis 
              type="number" 
              domain={[-4, 4]}
              tickFormatter={(v) => Math.abs(v).toString()}
              axisLine={{ stroke: 'hsl(215 16% 30%)' }}
              tickLine={{ stroke: 'hsl(215 16% 30%)' }}
              tick={{ fill: 'hsl(215 16% 60%)', fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              axisLine={{ stroke: 'hsl(215 16% 30%)' }}
              tickLine={false}
              tick={{ fill: 'hsl(0 0% 100%)', fontSize: 12 }}
              width={95}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 4, 4]}
              animationDuration={1500}
              animationBegin={300}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.favors === 'SEA' ? SEAHAWKS_COLOR : PATRIOTS_COLOR} 
                />
              ))}
              <LabelList 
                dataKey="displayValue" 
                position="right" 
                fill="hsl(0 0% 100%)"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Center line indicator */}
        <div className="text-center text-xs text-muted-foreground mt-2">
          ← Seahawks | Patriots →
        </div>
      </motion.div>
    </motion.section>
  );
}
