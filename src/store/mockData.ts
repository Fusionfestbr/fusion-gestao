export interface Sale {
  id: string;
  date: string; // ISO string
  isOnline: boolean;
  event: string;
  customer: string;
  purchaseValue: number;
  saleValue: number;
  profit: number;
  type: 'Venda Direta' | 'Venda Online';
}

export const initialSales: Sale[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isOnline: true,
    event: 'Feira de Saúde',
    customer: 'João Silva',
    purchaseValue: 50,
    saleValue: 120,
    profit: 70,
    type: 'Venda Online',
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    isOnline: false,
    event: 'Atendimento Domiciliar',
    customer: 'Maria Oliveira',
    purchaseValue: 30,
    saleValue: 80,
    profit: 50,
    type: 'Venda Direta',
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    isOnline: true,
    event: 'Campanha Online',
    customer: 'Carlos Santos',
    purchaseValue: 100,
    saleValue: 250,
    profit: 150,
    type: 'Venda Online',
  },
  {
    id: '4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    isOnline: false,
    event: 'Feira de Saúde',
    customer: 'Ana Costa',
    purchaseValue: 40,
    saleValue: 90,
    profit: 50,
    type: 'Venda Direta',
  },
  {
    id: '5',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    isOnline: true,
    event: 'Campanha Online',
    customer: 'João Silva',
    purchaseValue: 60,
    saleValue: 150,
    profit: 90,
    type: 'Venda Online',
  },
];
