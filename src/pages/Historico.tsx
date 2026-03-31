import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, Globe, Store, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { Sale } from '../store/mockData';

export default function Historico() {
  const { sales, deleteSale, updateSale } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({ date: '', isOnline: false, event: '', customer: '', purchaseValue: 0, saleValue: 0, type: 'Venda Direta' as const });
  const [isSaving, setIsSaving] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || sale.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [sales, searchTerm, filterType]);

  const topEvents = useMemo(() => {
    const eventTotals = sales.reduce((acc, s) => {
      acc[s.event] = (acc[s.event] || 0) + s.saleValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(eventTotals)
      .map(([name, total]) => ({ name, total: total as number }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-silver-100 tracking-tight">Histórico</h1>
        <p className="text-silver-400 mt-1">Registro completo de operações e melhores eventos</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Main Table Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-500" size={18} />
              <input
                type="text"
                placeholder="Buscar cliente, evento ou categoria..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-silver-500 transition-colors"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${showFilters || filterType !== 'all' ? 'bg-dark-700 border-silver-500 text-silver-200' : 'bg-dark-800 border-dark-600 text-silver-300 hover:bg-dark-700'}`}
              >
                <Filter size={18} />
                <span>Filtros {filterType !== 'all' && '(1)'}</span>
              </button>

              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-10 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { setFilterType('all'); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'all' ? 'bg-dark-700 text-silver-200' : 'text-silver-400 hover:bg-dark-700/50 hover:text-silver-300'}`}
                    >
                      Todos os tipos
                    </button>
                    <button
                      onClick={() => { setFilterType('Venda Direta'); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'Venda Direta' ? 'bg-dark-700 text-silver-200' : 'text-silver-400 hover:bg-dark-700/50 hover:text-silver-300'}`}
                    >
                      Venda Física
                    </button>
                    <button
                      onClick={() => { setFilterType('Venda Online'); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'Venda Online' ? 'bg-dark-700 text-silver-200' : 'text-silver-400 hover:bg-dark-700/50 hover:text-silver-300'}`}
                    >
                      Venda Online
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-900/50 text-silver-400 border-b border-dark-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Cliente / Evento</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium text-right">Valores</th>
                    <th className="px-6 py-4 font-medium text-center w-16">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-dark-700/50 transition-colors group">
                      <td className="px-6 py-4 text-silver-300">
                        {format(parseISO(sale.date), "dd MMM, yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-silver-200">{sale.customer}</div>
                        <div className="text-xs text-silver-500">{sale.event}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-600 text-silver-300 border border-dark-500">
                          {sale.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sale.isOnline ? (
                          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium">
                            <Globe size={14} /> Online
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                            <Store size={14} /> Física
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-silver-200">{formatCurrency(sale.saleValue)}</div>
                        <div className="text-xs flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-silver-500">Lucro:</span>
                          <span className={sale.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatCurrency(sale.profit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {deletingId === sale.id ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              onClick={async () => {
                                await deleteSale(sale.id);
                                setDeletingId(null);
                              }}
                              className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 bg-red-400/10 rounded"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="text-silver-400 hover:text-silver-200 text-xs font-medium px-2 py-1"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingSale(sale);
                                setEditForm({
                                  date: sale.date.split('T')[0],
                                  isOnline: sale.isOnline,
                                  event: sale.event,
                                  customer: sale.customer,
                                  purchaseValue: sale.purchaseValue,
                                  saleValue: sale.saleValue,
                                  type: sale.type,
                                });
                              }}
                              className="p-2 text-silver-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Editar lançamento"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingId(sale.id)}
                              className="p-2 text-silver-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Excluir lançamento"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-silver-500">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-silver-200 mb-4">Top 5 Eventos</h3>
            <div className="space-y-4">
              {topEvents.map((event, index) => (
                <div key={event.name} className="flex flex-col gap-1 pb-3 border-b border-dark-700 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-silver-200 font-medium text-sm truncate pr-2">
                      {index + 1}. {event.name}
                    </span>
                    <span className="text-silver-400 text-sm font-mono">
                      {formatCurrency(event.total)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-dark-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-silver-400 rounded-full"
                      style={{ width: `${Math.max(10, (event.total / (topEvents[0]?.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-silver-400 uppercase tracking-wider mb-4">Resumo Rápido</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-silver-300 text-sm">Total de Vendas</span>
                <span className="text-silver-100 font-medium">{sales.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-silver-300 text-sm">Vendas Online</span>
                <span className="text-silver-100 font-medium">
                  {sales.filter(s => s.type === 'Venda Online').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-silver-300 text-sm">Vendas Diretas</span>
                <span className="text-silver-100 font-medium">
                  {sales.filter(s => s.type === 'Venda Direta').length}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {editingSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-silver-100 mb-6">Editar Lançamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-silver-300 mb-2">Data</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm(p => ({ ...p, isOnline: false, type: 'Venda Direta' }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!editForm.isOnline ? 'bg-dark-700 text-silver-100' : 'text-silver-500 bg-dark-900'}`}
                >
                  Venda Física
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm(p => ({ ...p, isOnline: true, type: 'Venda Online' }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${editForm.isOnline ? 'bg-dark-700 text-silver-100' : 'text-silver-500 bg-dark-900'}`}
                >
                  Venda Online
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-300 mb-2">Evento</label>
                <input
                  type="text"
                  value={editForm.event}
                  onChange={e => setEditForm(p => ({ ...p, event: e.target.value }))}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500"
                />
              </div>

              {editForm.isOnline && (
                <div>
                  <label className="block text-sm font-medium text-silver-300 mb-2">Cliente</label>
                  <input
                    type="text"
                    value={editForm.customer}
                    onChange={e => setEditForm(p => ({ ...p, customer: e.target.value }))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500"
                  />
                </div>
              )}

              {editForm.isOnline && (
                <div>
                  <label className="block text-sm font-medium text-silver-300 mb-2">Valor de Compra</label>
                  <input
                    type="number"
                    value={editForm.purchaseValue}
                    onChange={e => setEditForm(p => ({ ...p, purchaseValue: Number(e.target.value) }))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-silver-300 mb-2">Valor de Venda</label>
                <input
                  type="number"
                  value={editForm.saleValue}
                  onChange={e => setEditForm(p => ({ ...p, saleValue: Number(e.target.value) }))}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-silver-200 focus:outline-none focus:border-silver-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSale(null)}
                className="flex-1 py-3 rounded-xl text-silver-300 hover:bg-dark-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!editingSale) return;
                  setIsSaving(true);
                  try {
                    await updateSale(editingSale.id, {
                      date: new Date(editForm.date).toISOString(),
                      isOnline: editForm.isOnline,
                      event: editForm.event,
                      customer: editForm.isOnline ? editForm.customer : 'Venda Física',
                      purchaseValue: editForm.isOnline ? editForm.purchaseValue : 0,
                      saleValue: editForm.saleValue,
                      type: editForm.type,
                    });
                    setEditingSale(null);
                  } catch (err) {
                    console.error('Erro ao editar:', err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="flex-1 py-3 bg-silver-200 text-dark-900 font-semibold rounded-xl hover:bg-white transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
