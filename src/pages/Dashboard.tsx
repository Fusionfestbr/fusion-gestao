import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, Users, Calendar, Target, Award } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const { sales, monthlyGoal } = useStore();

  const metrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Monthly Sales
    const monthlySales = sales.filter(s =>
      isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd })
    );

    const monthlyTotal = monthlySales.reduce((acc, s) => acc + s.saleValue, 0);
    const monthlyProfit = monthlySales.reduce((acc, s) => acc + s.profit, 0);

    // Goal Progress
    const goalProgress = Math.min((monthlyTotal / monthlyGoal) * 100, 100);

    // Weekly Chart Data (last 7 days)
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(now, 6 - i);
      const daySales = sales.filter(s => format(parseISO(s.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      return {
        name: format(date, 'EEE', { locale: ptBR }),
        vendas: daySales.reduce((acc, s) => acc + s.saleValue, 0),
        lucro: daySales.reduce((acc, s) => acc + s.profit, 0),
      };
    });

    const weeklyTotal = weeklyData.reduce((acc, d) => acc + d.vendas, 0);
    const weeklyProfit = weeklyData.reduce((acc, d) => acc + d.lucro, 0);

    // Monthly Chart Data (days of the current month)
    const daysInMonth = now.getDate();
    const monthlyData = Array.from({ length: daysInMonth }).map((_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const daySales = sales.filter(s => format(parseISO(s.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      return {
        name: format(date, 'dd/MM'),
        vendas: daySales.reduce((acc, s) => acc + s.saleValue, 0),
        lucro: daySales.reduce((acc, s) => acc + s.profit, 0),
      };
    });

    // Top 5 Customers (apenas Venda Online)
    const customerTotals = sales
      .filter(s => s.type === 'Venda Online')
      .reduce((acc, s) => {
        acc[s.customer] = (acc[s.customer] || 0) + s.saleValue;
        return acc;
      }, {} as Record<string, number>);

    const topCustomers = Object.entries(customerTotals)
      .map(([name, total]) => ({ name, total: total as number }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Top 5 Events of the month
    const eventTotals = monthlySales.reduce((acc, s) => {
      acc[s.event] = (acc[s.event] || 0) + s.saleValue;
      return acc;
    }, {} as Record<string, number>);

    const topEvents = Object.entries(eventTotals)
      .map(([name, total]) => ({ name, total: total as number }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { monthlyTotal, monthlyProfit, goalProgress, weeklyData, weeklyTotal, weeklyProfit, monthlyData, topCustomers, topEvents };
  }, [sales, monthlyGoal]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-silver-100 tracking-tight">Painel de Controle</h1>
        <p className="text-silver-400 mt-1">Visão geral do seu negócio</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-silver-400 font-medium">Vendas na Semana</h3>
            <div className="p-2 bg-dark-700 rounded-lg"><TrendingUp size={20} className="text-silver-200" /></div>
          </div>
          <p className="text-3xl font-bold text-silver-100">{formatCurrency(metrics.weeklyTotal)}</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-silver-400 font-medium">Lucro na Semana</h3>
            <div className="p-2 bg-dark-700 rounded-lg"><Award size={20} className="text-silver-200" /></div>
          </div>
          <p className="text-3xl font-bold text-silver-100">{formatCurrency(metrics.weeklyProfit)}</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-silver-400 font-medium">Vendas no Mês</h3>
            <div className="p-2 bg-dark-700 rounded-lg"><TrendingUp size={20} className="text-silver-200" /></div>
          </div>
          <p className="text-3xl font-bold text-silver-100">{formatCurrency(metrics.monthlyTotal)}</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-silver-400 font-medium">Lucro no Mês</h3>
            <div className="p-2 bg-dark-700 rounded-lg"><Award size={20} className="text-silver-200" /></div>
          </div>
          <p className="text-3xl font-bold text-silver-100">{formatCurrency(metrics.monthlyProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3 bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-silver-400 font-medium">Meta Mensal</h3>
            <div className="p-2 bg-dark-700 rounded-lg"><Target size={20} className="text-silver-200" /></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-silver-300">{formatCurrency(metrics.monthlyTotal)}</span>
              <span className="text-silver-500">de {formatCurrency(monthlyGoal)}</span>
            </div>
            <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics.goalProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-silver-300 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-silver-200 mb-6 flex items-center gap-2">
            <Calendar size={18} />
            Desempenho Semanal
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#262626', borderRadius: '8px', color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" animationDuration={1500} />
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLucro)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-silver-200 mb-6 flex items-center gap-2">
            <Calendar size={18} />
            Desempenho Mensal
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendasMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucroMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#262626', borderRadius: '8px', color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVendasMonth)" animationDuration={1500} />
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLucroMonth)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-silver-200 mb-6 flex items-center gap-2">
            <Users size={18} />
            Top 5 Clientes
          </h3>
          <div className="space-y-4">
            {metrics.topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-silver-300 font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-silver-200 font-medium">{customer.name}</span>
                </div>
                <span className="text-silver-400 text-sm">{formatCurrency(customer.total)}</span>
              </div>
            ))}
            {metrics.topCustomers.length === 0 && (
              <p className="text-silver-500 text-sm text-center py-4">Nenhum dado disponível.</p>
            )}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-silver-200 mb-6 flex items-center gap-2">
            <Award size={18} />
            Top 5 Eventos do Mês
          </h3>
          <div className="space-y-4">
            {metrics.topEvents.map((event, index) => (
              <div key={event.name} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-silver-300 font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-silver-200 font-medium">{event.name}</span>
                </div>
                <span className="text-silver-400 text-sm">{formatCurrency(event.total)}</span>
              </div>
            ))}
            {metrics.topEvents.length === 0 && (
              <p className="text-silver-500 text-sm text-center py-4">Nenhum dado disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
