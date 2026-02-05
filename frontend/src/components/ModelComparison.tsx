import { motion } from 'framer-motion';
import { ModelType, ModelMetrics } from '@/lib/api';

interface ModelComparisonProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  modelMetrics: ModelMetrics[];
  isLoading: boolean;
}

export function ModelComparison({ 
  selectedModel, 
  onModelChange, 
  modelMetrics,
  isLoading 
}: ModelComparisonProps) {
  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
    >
      <motion.h2
        className="text-xl md:text-2xl font-bold text-center mb-6 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        Model Comparison
      </motion.h2>

      {/* Toggle Switch */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="inline-flex rounded-full p-1 glass">
          <button
            onClick={() => onModelChange('logistic_regression')}
            disabled={isLoading}
            className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
              selectedModel === 'logistic_regression'
                ? 'gradient-gold text-background'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Logistic Regression
          </button>
          <button
            onClick={() => onModelChange('random_forest')}
            disabled={isLoading}
            className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
              selectedModel === 'random_forest'
                ? 'gradient-gold text-background'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Random Forest
          </button>
        </div>
      </motion.div>

      {/* Metrics Table */}
      <motion.div
        className="glass rounded-2xl overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Model</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Accuracy</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Log Loss</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">ROC AUC</th>
            </tr>
          </thead>
          <tbody>
            {modelMetrics.map((metric) => {
              const isActive = 
                (metric.model_name === 'Logistic Regression' && selectedModel === 'logistic_regression') ||
                (metric.model_name === 'Random Forest' && selectedModel === 'random_forest');
              
              return (
                <tr 
                  key={metric.model_name}
                  className={`border-b border-white/5 transition-colors ${
                    isActive ? 'bg-white/10' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-gold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                        {metric.model_name}
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-center ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                    {(metric.accuracy * 100).toFixed(1)}%
                    <span className="text-xs text-muted-foreground ml-1">
                      ±{(metric.accuracy_std * 100).toFixed(1)}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-center ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                    {metric.log_loss.toFixed(3)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ±{metric.log_loss_std.toFixed(3)}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-center ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                    {metric.roc_auc.toFixed(3)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ±{metric.roc_auc_std.toFixed(3)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </motion.section>
  );
}
