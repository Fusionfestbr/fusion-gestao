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
  deleteSale: (id: string) => Promise<void>;
  monthlyGoal: number;
  setMonthlyGoal: (goal: number) => Promise<void>;
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
  const [monthlyGoal, setMonthlyGoalState] = useState<number>(5000);

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
      setMonthlyGoalState(5000);
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
      .select('monthly_goal')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setMonthlyGoalState(Number(data.monthly_goal));
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

  const setMonthlyGoal = useCallback(async (goal: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, monthly_goal: goal, updated_at: new Date().toISOString() });

    if (error) throw error;
    setMonthlyGoalState(goal);
  }, [user]);

  return (
    <StoreContext.Provider value={{ user, loading, login, signUp, logout, sales, addSale, deleteSale, monthlyGoal, setMonthlyGoal }}>
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
