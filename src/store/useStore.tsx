import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Sale } from './mockData';
import type { User } from '@supabase/supabase-js';

interface StoreContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'profit'>) => Promise<void>;
  updateSale: (id: string, sale: Partial<Omit<Sale, 'id' | 'profit'>>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  monthlyProfitGoal: number;
  setMonthlyProfitGoal: (goal: number) => Promise<void>;
  weeklyProfitGoal: number;
  setWeeklyProfitGoal: (goal: number) => Promise<void>;
  dailyProfitGoal: number;
  setDailyProfitGoal: (goal: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Converte snake_case do banco para camelCase da interface Sale
function dbToSale(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    date: row.date as string,
    isOnline: row.is_online as boolean,
    event: row.event as string,
    customer: row.customer as string,
    purchaseValue: Number(row.purchase_value),
    saleValue: Number(row.sale_value),
    profit: Number(row.profit),
    type: row.type as Sale['type'],
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [monthlyProfitGoal, setMonthlyProfitGoalState] = useState<number>(5000);
  const [weeklyProfitGoal, setWeeklyProfitGoalState] = useState<number>(1200);
  const [dailyProfitGoal, setDailyProfitGoalState] = useState<number>(200);

  // Carrega sessão atual ao iniciar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega vendas e configurações quando o usuário loga
  useEffect(() => {
    if (!user) {
      setSales([]);
      setMonthlyProfitGoalState(5000);
      setWeeklyProfitGoalState(1200);
      setDailyProfitGoalState(200);
      return;
    }

    // Carregar vendas
    supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao carregar vendas:', error);
        else setSales((data ?? []).map(dbToSale));
      });

    // Carregar configurações
    supabase
      .from('user_settings')
      .select('monthly_profit_goal, weekly_profit_goal, daily_profit_goal')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          if (data.monthly_profit_goal) setMonthlyProfitGoalState(Number(data.monthly_profit_goal));
          if (data.weekly_profit_goal) setWeeklyProfitGoalState(Number(data.weekly_profit_goal));
          if (data.daily_profit_goal) setDailyProfitGoalState(Number(data.daily_profit_goal));
        }
      });
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'profit'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('sales')
      .insert({
        date: saleData.date,
        is_online: saleData.isOnline,
        event: saleData.event,
        customer: saleData.customer,
        purchase_value: saleData.purchaseValue,
        sale_value: saleData.saleValue,
        type: saleData.type,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) setSales(prev => [dbToSale(data), ...prev]);
  }, [user]);

  const deleteSale = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setSales(prev => prev.filter(sale => sale.id !== id));
  }, []);

  const setMonthlyProfitGoal = useCallback(async (goal: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, monthly_profit_goal: goal, updated_at: new Date().toISOString() });

    if (error) throw error;
    setMonthlyProfitGoalState(goal);
  }, [user]);

  const setWeeklyProfitGoal = useCallback(async (goal: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, weekly_profit_goal: goal, updated_at: new Date().toISOString() });

    if (error) throw error;
    setWeeklyProfitGoalState(goal);
  }, [user]);

  const setDailyProfitGoal = useCallback(async (goal: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, daily_profit_goal: goal, updated_at: new Date().toISOString() });

    if (error) throw error;
    setDailyProfitGoalState(goal);
  }, [user]);

  const updateSale = useCallback(async (id: string, saleData: Partial<Omit<Sale, 'id' | 'profit'>>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const existing = sales.find(s => s.id === id);
    if (!existing) throw new Error('Venda não encontrada');

    const updateData: Record<string, unknown> = {};
    if (saleData.date !== undefined) updateData.date = saleData.date;
    if (saleData.isOnline !== undefined) updateData.is_online = saleData.isOnline;
    if (saleData.event !== undefined) updateData.event = saleData.event;
    if (saleData.customer !== undefined) updateData.customer = saleData.customer;
    if (saleData.purchaseValue !== undefined) updateData.purchase_value = saleData.purchaseValue;
    if (saleData.saleValue !== undefined) updateData.sale_value = saleData.saleValue;
    if (saleData.type !== undefined) updateData.type = saleData.type;

    const newSaleValue = saleData.saleValue ?? existing.saleValue;
    const newPurchaseValue = saleData.purchaseValue ?? existing.purchaseValue;
    updateData.profit = existing.isOnline ? newSaleValue - newPurchaseValue : newSaleValue;

    const { data, error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setSales(prev => prev.map(s => s.id === id ? dbToSale(data) : s));
    }
  }, [user, sales]);

  return (
    <StoreContext.Provider value={{ user, loading, login, signUp, logout, sales, addSale, updateSale, deleteSale, monthlyProfitGoal, setMonthlyProfitGoal, weeklyProfitGoal, setWeeklyProfitGoal, dailyProfitGoal, setDailyProfitGoal }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
