import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sale } from '../store/mockData';
import { formatCurrency } from './utils';

type ExcelRow = Record<string, string | number | undefined>;

export function exportToPDF(sales: Sale[], monthlyProfit: number, monthlyGoal: number) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Fusion Gestão - Relatório', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Data de geração: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 105, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Resumo Financeiro', 14, 45);
  doc.setFontSize(11);
  doc.text(`Lucro do mês: ${formatCurrency(monthlyProfit)}`, 14, 55);
  doc.text(`Meta de lucro: ${formatCurrency(monthlyGoal)}`, 14, 62);
  doc.text(`Progresso: ${Math.min(Math.round((monthlyProfit / monthlyGoal) * 100), 100)}%`, 14, 69);
  
  doc.setFontSize(14);
  doc.text('Histórico de Vendas', 14, 85);
  
  const headers = ['Data', 'Cliente', 'Evento', 'Tipo', 'Venda', 'Lucro'];
  const colWidths = [25, 35, 35, 25, 25, 25];
  let y = 95;
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  headers.forEach((header, i) => {
    const x = 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(header, x, y);
  });
  y += 5;
  
  doc.setTextColor(0);
  sales.forEach((sale, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    const row = [
      format(parseISO(sale.date), 'dd/MM/yyyy'),
      sale.customer.substring(0, 15),
      sale.event.substring(0, 15),
      sale.isOnline ? 'Online' : 'Física',
      formatCurrency(sale.saleValue),
      formatCurrency(sale.profit),
    ];
    
    row.forEach((cell, i) => {
      const x = 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(cell, x, y);
    });
    
    y += 7;
  });
  
  const totalVendas = sales.reduce((acc, s) => acc + s.saleValue, 0);
  const totalLucro = sales.reduce((acc, s) => acc + s.profit, 0);
  
  y += 10;
  doc.setFontSize(11);
  doc.text(`Total de vendas: ${formatCurrency(totalVendas)}`, 14, y);
  doc.text(`Total de lucro: ${formatCurrency(totalLucro)}`, 14, y + 7);
  
  doc.save(`fusion-gestao-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportToExcel(sales: Sale[], monthlyProfit: number, monthlyGoal: number) {
  const data: ExcelRow[] = sales.map(sale => ({
    Data: format(parseISO(sale.date), 'yyyy-MM-dd'),
    Cliente: sale.customer,
    Evento: sale.event,
    'Tipo de Venda': sale.isOnline ? 'Venda Online' : 'Venda Física',
    'Categoria': sale.type,
    'Valor de Venda': sale.saleValue,
    'Valor de Compra': sale.purchaseValue,
    Lucro: sale.profit,
  }));
  
  data.push({ Data: '', Cliente: '', Evento: '', 'Tipo de Venda': '', 'Categoria': '', 'Valor de Venda': 0, 'Valor de Compra': 0, Lucro: 0 });
  data.push({ Data: 'RESUMO', Cliente: '', Evento: '', 'Tipo de Venda': '', 'Categoria': '', 'Valor de Venda': 0, 'Valor de Compra': 0, Lucro: 0 });
  data.push({ Data: 'Meta de Lucro', Cliente: formatCurrency(monthlyGoal), Evento: '', 'Tipo de Venda': '', 'Categoria': '', 'Valor de Venda': 0, 'Valor de Compra': 0, Lucro: 0 });
  data.push({ Data: 'Lucro Atual', Cliente: formatCurrency(monthlyProfit), Evento: '', 'Tipo de Venda': '', 'Categoria': '', 'Valor de Venda': 0, 'Valor de Compra': 0, Lucro: 0 });
  data.push({ Data: 'Progresso', Cliente: `${Math.min(Math.round((monthlyProfit / monthlyGoal) * 100), 100)}%`, Evento: '', 'Tipo de Venda': '', 'Categoria': '', 'Valor de Venda': 0, 'Valor de Compra': 0, Lucro: 0 });
  
  const ws = XLSX.utils.json_to_sheet(data as Record<string, unknown>[]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
  XLSX.writeFile(wb, `fusion-gestao-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}