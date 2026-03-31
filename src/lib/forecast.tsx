import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';

interface ForecastData {
  predictedProfit: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export function useSalesForecast() {
  const { sales } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);

  const generateForecast = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);

      try {
        const last30Days = sales
          .filter(s => new Date(s.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const monthlyTotal = last30Days.reduce((acc, s) => acc + s.profit, 0);
        const avgDaily = monthlyTotal / 30;
        
        const last7Days = sales
          .filter(s => new Date(s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((acc, s) => acc + s.profit, 0);
        
        const prev7Days = sales
          .filter(s => {
            const date = new Date(s.date);
            const now = new Date();
            return date > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) && date <= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          })
          .reduce((acc, s) => acc + s.profit, 0);

        const trend = last7Days > prev7Days ? 'up' : last7Days < prev7Days ? 'down' : 'stable';
        
        const growthRate = prev7Days > 0 ? ((last7Days - prev7Days) / prev7Days) : 0;
        const predictedProfit = Math.max(0, avgDaily * 30 * (1 + growthRate * 0.5));
        const confidence = Math.min(95, 50 + Math.min(45, Math.abs(growthRate * 100)));

        const onlineCount = sales.filter(s => s.isOnline).length;
        const offlineCount = sales.filter(s => !s.isOnline).length;
        const factors = [
          onlineCount > offlineCount ? 'Alta participação de vendas online' : 'Alta participação de vendas físicas',
          last7Days > avgDaily * 7 ? 'Tendência de crescimento recente' : 'Estabilidade de vendas',
          monthlyTotal > 0 ? 'Lucro mensal positivo' : 'Necessário aumentar vendas',
        ];

        setForecast({
          predictedProfit: Math.round(predictedProfit),
          confidence: Math.round(confidence),
          trend,
          factors,
        });
      } catch (err) {
        setError('Erro ao gerar previsão.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  }, [sales]);

  return { forecast, loading, error, generateForecast };
}

export default function ForecastWidget() {
  const { forecast, loading, error, generateForecast } = useSalesForecast();

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-silver-200">Previsão de Lucro</h3>
        <button
          onClick={generateForecast}
          disabled={loading}
          className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
        >
          {loading ? 'Calculando...' : 'Atualizar'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {forecast && !error && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-silver-100">{formatCurrency(forecast.predictedProfit)}</p>
              <p className="text-sm text-silver-400">Lucro previsto para próximo mês</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              forecast.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
              forecast.trend === 'down' ? 'bg-red-500/20 text-red-400' :
              'bg-silver-500/20 text-silver-400'
            }`}>
              {forecast.trend === 'up' ? '↑ Alta' : forecast.trend === 'down' ? '↓ Baixa' : '→ Estável'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-silver-400">Confiança:</span>
            <div className="flex-1 h-2 bg-dark-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${forecast.confidence}%` }}
              />
            </div>
            <span className="text-sm text-silver-300">{forecast.confidence}%</span>
          </div>

          {forecast.factors.length > 0 && (
            <div className="pt-2 border-t border-dark-700">
              <p className="text-xs text-silver-500 mb-2">Fatores influentes:</p>
              <ul className="space-y-1">
                {forecast.factors.map((factor, i) => (
                  <li key={i} className="text-sm text-silver-400">• {factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!forecast && !error && !loading && (
        <p className="text-silver-500 text-sm">
          Clique em "Atualizar" para gerar uma previsão de lucro baseada nos seus dados.
        </p>
      )}
    </div>
  );
}
