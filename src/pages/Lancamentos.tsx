import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calculator, Globe, Store } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';

export default function Lancamentos() {
  const { addSale } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    isOnline: false,
    event: '',
    customer: '',
    purchaseValue: '',
    saleValue: '',
    type: 'Venda Direta' as const,
  });

  const profit = formData.isOnline
    ? Number(formData.saleValue) - Number(formData.purchaseValue)
    : Number(formData.saleValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addSale({
        date: new Date(formData.date).toISOString(),
        isOnline: formData.isOnline,
        event: formData.event,
        customer: formData.isOnline ? formData.customer : 'Venda Física',
        purchaseValue: formData.isOnline ? Number(formData.purchaseValue) : 0,
        saleValue: Number(formData.saleValue),
        type: formData.type,
      });
      navigate('/historico');
    } catch (err) {
      console.error('Erro ao registrar lançamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-silver-100 tracking-tight">Novo Lançamento</h1>
        <p className="text-silver-400 mt-1">Registre uma nova venda no sistema</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="space-y-6">

          {/* Tipo de Venda (Online/Física) */}
          <div className="flex gap-4 p-1 bg-dark-900 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, isOnline: false, type: 'Venda Direta' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${!formData.isOnline ? 'bg-dark-700 text-silver-100 shadow-sm' : 'text-silver-500 hover:text-silver-300'
                }`}
            >
              <Store size={18} />
              Venda Física
            </button>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, isOnline: true, type: 'Venda Online' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${formData.isOnline ? 'bg-dark-700 text-silver-100 shadow-sm' : 'text-silver-500 hover:text-silver-300'
                }`}
            >
              <Globe size={18} />
              Venda Online
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-silver-300 mb-2">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {formData.isOnline && (
              <div>
                <label className="block text-sm font-medium text-silver-300 mb-2">Cliente</label>
                <input
                  type="text"
                  required={formData.isOnline}
                  value={formData.customer}
                  onChange={e => setFormData(p => ({ ...p, customer: e.target.value }))}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                  placeholder="Nome do cliente"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-silver-300 mb-2">Evento / Origem</label>
              <input
                type="text"
                required
                value={formData.event}
                onChange={e => setFormData(p => ({ ...p, event: e.target.value }))}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                placeholder="Ex: Feira de Saúde"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-silver-300 mb-2">Categoria</label>
              <select
                value={formData.type}
                onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500 transition-colors appearance-none"
              >
                <option value="Venda Direta">Venda Direta</option>
                <option value="Venda Online">Venda Online</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dark-700">
            {formData.isOnline && (
              <div>
                <label className="block text-sm font-medium text-silver-300 mb-2">Valor de Compra (Custo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required={formData.isOnline}
                    value={formData.purchaseValue}
                    onChange={e => setFormData(p => ({ ...p, purchaseValue: e.target.value }))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                    placeholder="0,00"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-silver-300 mb-2">Valor de Venda</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.saleValue}
                  onChange={e => setFormData(p => ({ ...p, saleValue: e.target.value }))}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Profit Preview */}
          <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-silver-400">
              <Calculator size={20} />
              <span className="font-medium">Lucro Estimado</span>
            </div>
            <span className={`text-xl font-bold ${profit > 0 ? 'text-emerald-400' : profit < 0 ? 'text-red-400' : 'text-silver-300'}`}>
              {formatCurrency(profit || 0)}
            </span>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-effect w-full bg-silver-200 text-dark-900 font-semibold rounded-xl px-4 py-4 flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  <span>Registrar Lançamento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
