import React, { useState } from 'react';
import { Target, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';

export default function Configuracoes() {
  const { monthlyGoal, setMonthlyGoal } = useStore();
  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = Number(goalInput);
    if (newGoal > 0) {
      try {
        await setMonthlyGoal(newGoal);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        console.error('Erro ao salvar meta:', err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-silver-100 tracking-tight">Configurações</h1>
        <p className="text-silver-400 mt-1">Ajuste as preferências do sistema</p>
      </header>

      <div className="bg-dark-800 border border-dark-600 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-dark-700 rounded-xl">
            <Target className="text-silver-200" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-silver-100">Meta Mensal</h2>
            <p className="text-sm text-silver-400">Defina o objetivo de vendas para o mês</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-silver-300 mb-2">
              Valor da Meta
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                placeholder="Ex: 5000.00"
              />
            </div>
            <p className="text-xs text-silver-500 mt-2">
              Meta atual: {formatCurrency(monthlyGoal)}
            </p>
          </div>

          <button
            type="submit"
            className="btn-effect w-full bg-silver-200 text-dark-900 font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            <Save size={18} />
            <span>{isSaved ? 'Meta Salva!' : 'Salvar Meta'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
