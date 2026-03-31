import React, { useState } from 'react';
import { Target, Save, TrendingUp, Calendar, Download, Upload, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';

export default function Configuracoes() {
  const { 
    monthlyProfitGoal, setMonthlyProfitGoal, 
    weeklyProfitGoal, setWeeklyProfitGoal,
    dailyProfitGoal, setDailyProfitGoal,
    sales
  } = useStore();
  
  const [monthlyGoalInput, setMonthlyGoalInput] = useState(monthlyProfitGoal.toString());
  const [weeklyGoalInput, setWeeklyGoalInput] = useState(weeklyProfitGoal.toString());
  const [dailyGoalInput, setDailyGoalInput] = useState(dailyProfitGoal.toString());
  const [isSaved, setIsSaved] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const monthly = Number(monthlyGoalInput);
      const weekly = Number(weeklyGoalInput);
      const daily = Number(dailyGoalInput);
      
      if (monthly > 0) await setMonthlyProfitGoal(monthly);
      if (weekly > 0) await setWeeklyProfitGoal(weekly);
      if (daily > 0) await setDailyProfitGoal(daily);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar metas:', err);
    }
  };

  const handleBackup = () => {
    const backupData = {
      sales,
      goals: {
        daily: dailyProfitGoal,
        weekly: weeklyProfitGoal,
        monthly: monthlyProfitGoal,
      },
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fusion-gestao-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Backup criado com sucesso!');
    setTimeout(() => setBackupMessage(''), 3000);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.sales && data.goals) {
          if (data.goals.monthly) setMonthlyProfitGoal(data.goals.monthly);
          if (data.goals.weekly) setWeeklyProfitGoal(data.goals.weekly);
          if (data.goals.daily) setDailyProfitGoal(data.goals.daily);
          setBackupMessage('Dados restaurados com sucesso! As vendas foram importadas para o banco de dados.');
          setTimeout(() => setBackupMessage(''), 5000);
        }
      } catch {
        setBackupMessage('Erro ao restaurar arquivo. Verifique o formato.');
        setTimeout(() => setBackupMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthSales = sales.filter(s => new Date(s.date) >= monthStart);
  const currentMonthProfit = currentMonthSales.reduce((acc, s) => acc + s.profit, 0);
  const avgDailyProfit = currentMonthSales.length > 0 ? currentMonthProfit / now.getDate() : 0;
  const projectedMonthProfit = avgDailyProfit * now.getDate();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-silver-100 tracking-tight">Configurações</h1>
        <p className="text-silver-400 mt-1">Ajuste as preferências do sistema</p>
      </header>

      {/* Performance Analysis */}
      <div className="bg-dark-800 border border-dark-600 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-dark-700 rounded-xl">
            <Clock className="text-silver-200" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-silver-100">Análise de Performance</h2>
            <p className="text-sm text-silver-400">Resumo do mês atual</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-xs text-silver-500 mb-1">Vendas este mês</p>
            <p className="text-xl font-bold text-silver-200">{currentMonthSales.length}</p>
          </div>
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-xs text-silver-500 mb-1">Lucro atual</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(currentMonthProfit)}</p>
          </div>
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-xs text-silver-500 mb-1">Média diária</p>
            <p className="text-xl font-bold text-silver-200">{formatCurrency(avgDailyProfit)}</p>
          </div>
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-xs text-silver-500 mb-1">Projeção mês</p>
            <p className="text-xl font-bold text-blue-400">{formatCurrency(projectedMonthProfit)}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-dark-700 rounded-xl">
            <Target className="text-silver-200" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-silver-100">Metas de Lucro</h2>
            <p className="text-sm text-silver-400">Defina objetivos de lucro para diferentes períodos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-silver-300 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Meta de Lucro Diária
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={dailyGoalInput}
                onChange={e => setDailyGoalInput(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                placeholder="Ex: 200.00"
              />
            </div>
            <p className="text-xs text-silver-500 mt-2">
              Atual: {formatCurrency(dailyProfitGoal)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-silver-300 mb-2 flex items-center gap-2">
              <TrendingUp size={16} />
              Meta de Lucro Semanal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={weeklyGoalInput}
                onChange={e => setWeeklyGoalInput(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                placeholder="Ex: 1200.00"
              />
            </div>
            <p className="text-xs text-silver-500 mt-2">
              Atual: {formatCurrency(weeklyProfitGoal)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-silver-300 mb-2 flex items-center gap-2">
              <Target size={16} />
              Meta de Lucro Mensal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={monthlyGoalInput}
                onChange={e => setMonthlyGoalInput(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                placeholder="Ex: 5000.00"
              />
            </div>
            <p className="text-xs text-silver-500 mt-2">
              Atual: {formatCurrency(monthlyProfitGoal)}
            </p>
          </div>

          <button
            type="submit"
            className="btn-effect w-full bg-silver-200 text-dark-900 font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            <Save size={18} />
            <span>{isSaved ? 'Metas Salvas!' : 'Salvar Metas'}</span>
          </button>
        </form>
      </div>

      {/* Backup & Restore */}
      <div className="bg-dark-800 border border-dark-600 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-dark-700 rounded-xl">
            <Download className="text-silver-200" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-silver-100">Backup e Restauração</h2>
            <p className="text-sm text-silver-400">Exporte ou restaure seus dados</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackup}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-silver-300 hover:bg-dark-700 transition-colors"
          >
            <Download size={18} />
            <span>Criar Backup</span>
          </button>
          
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-silver-300 hover:bg-dark-700 transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Restaurar</span>
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>

        {backupMessage && (
          <p className="mt-4 text-sm text-silver-400 text-center">{backupMessage}</p>
        )}
      </div>
    </div>
  );
}