import type { User, Supplier, Customer, Batch, Product, PackagingRecord, StockMovement, Sale, SaleItem, CashSession, Expense, Alert } from './types'

export const mockUsers: User[] = [
  { id: 'u1', name: 'Maria da Silva', email: 'maria@acaitiamaria.com', role: 'admin', status: 'ativo', created_at: '2024-01-01' },
  { id: 'u2', name: 'João Santos', email: 'joao@acaitiamaria.com', role: 'gerente', status: 'ativo', created_at: '2024-01-15' },
  { id: 'u3', name: 'Ana Lima', email: 'ana@acaitiamaria.com', role: 'vendedor', status: 'ativo', created_at: '2024-02-01' },
  { id: 'u4', name: 'Carlos Oliveira', email: 'carlos@acaitiamaria.com', role: 'producao', status: 'ativo', created_at: '2024-02-10' },
  { id: 'u5', name: 'Fernanda Costa', email: 'fernanda@acaitiamaria.com', role: 'caixa', status: 'ativo', created_at: '2024-03-01' },
]

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Fazenda Ouro Verde', phone: '', location: '', supply_type: 'Açaí in natura', avg_price_per_box: 0, rating: 5, notes: '', created_at: '2024-01-01' },
]

export const mockCustomers: Customer[] = []

export const mockBatches: Batch[] = []

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Açaí 500ml', volume_liters: 0.5, sale_price: 8.00, minimum_stock: 50, current_stock: 120, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p2', name: 'Açaí 1 Litro', volume_liters: 1.0, sale_price: 15.00, minimum_stock: 40, current_stock: 85, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p3', name: 'Açaí 2 Litros', volume_liters: 2.0, sale_price: 28.00, minimum_stock: 30, current_stock: 42, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p4', name: 'Açaí 5 Litros', volume_liters: 5.0, sale_price: 65.00, minimum_stock: 10, current_stock: 18, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p5', name: 'Açaí Grosso 1L', volume_liters: 1.0, sale_price: 18.00, minimum_stock: 20, current_stock: 35, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p6', name: 'Açaí Fino 1L', volume_liters: 1.0, sale_price: 12.00, minimum_stock: 20, current_stock: 8, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p7', name: 'Açaí Premium 1L', volume_liters: 1.0, sale_price: 22.00, minimum_stock: 15, current_stock: 25, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p8', name: 'Açaí 500ml Grosso', volume_liters: 0.5, sale_price: 10.00, minimum_stock: 30, current_stock: 55, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p9', name: 'Polpa Açaí 400g', volume_liters: 0.4, sale_price: 7.00, minimum_stock: 25, current_stock: 12, status: 'ativo', created_at: '2024-01-01' },
  { id: 'p10', name: 'Açaí 10 Litros', volume_liters: 10.0, sale_price: 120.00, minimum_stock: 5, current_stock: 6, status: 'ativo', created_at: '2024-01-01' },
]

export const mockSales: Sale[] = []

export const mockPackaging: PackagingRecord[] = []

export const mockStockMovements: StockMovement[] = []

export const mockExpenses: Expense[] = []

export const mockCashSession: CashSession = {
  id: 'cs1',
  opening_date: '2026-06-16',
  operator_name: 'Fernanda Costa',
  opening_amount: 200,
  expected_amount: 789,
  informed_amount: 0,
  difference_amount: 0,
  total_cash: 72,
  total_pix: 342,
  total_debit: 30,
  total_credit: 0,
  total_fiado: 185,
  total_discounts: 15,
  total_expenses: 230,
  total_sangria: 0,
  status: 'aberto',
  notes: '',
  created_at: '2026-06-16T07:00:00',
}

export const mockAlerts: Alert[] = []

// Chart data
export const dailyRevenueData = [
  { date: '10/06', faturamento: 3200, custo: 1800, lucro: 1400 },
  { date: '11/06', faturamento: 2800, custo: 1600, lucro: 1200 },
  { date: '12/06', faturamento: 3900, custo: 2100, lucro: 1800 },
  { date: '13/06', faturamento: 4100, custo: 2200, lucro: 1900 },
  { date: '14/06', faturamento: 3600, custo: 1900, lucro: 1700 },
  { date: '15/06', faturamento: 4060, custo: 2200, lucro: 1860 },
  { date: '16/06', faturamento: 789, custo: 450, lucro: 339 },
]

export const productionVsSalesData = [
  { date: '10/06', produzido: 260, vendido: 220, estoque: 40 },
  { date: '11/06', produzido: 180, vendido: 165, estoque: 55 },
  { date: '12/06', produzido: 308, vendido: 275, estoque: 88 },
  { date: '13/06', produzido: 325, vendido: 290, estoque: 123 },
  { date: '14/06', produzido: 150, vendido: 180, estoque: 93 },
  { date: '15/06', produzido: 252, vendido: 200, estoque: 145 },
  { date: '16/06', produzido: 475, vendido: 63, estoque: 557 },
]

export const paymentMethodData = [
  { name: 'PIX', value: 342, color: '#7A2E83' },
  { name: 'Dinheiro', value: 72, color: '#2E7D32' },
  { name: 'Débito', value: 30, color: '#1565C0' },
  { name: 'Fiado', value: 185, color: '#FBC02D' },
  { name: 'Transferência', value: 350, color: '#5B145F' },
]

export const monthlyData = [
  { month: 'Jan', faturamento: 68000, despesas: 42000, lucro: 26000 },
  { month: 'Fev', faturamento: 72000, despesas: 44000, lucro: 28000 },
  { month: 'Mar', faturamento: 85000, despesas: 51000, lucro: 34000 },
  { month: 'Abr', faturamento: 79000, despesas: 48000, lucro: 31000 },
  { month: 'Mai', faturamento: 91000, despesas: 54000, lucro: 37000 },
  { month: 'Jun', faturamento: 45000, despesas: 28000, lucro: 17000 },
]

export const expensesByCategoryData = [
  { category: 'Compra açaí', valor: 48000 },
  { category: 'Mão de obra', valor: 8000 },
  { category: 'Embalagens', valor: 3500 },
  { category: 'Energia', valor: 1800 },
  { category: 'Aluguel', valor: 1200 },
  { category: 'Gelo', valor: 900 },
  { category: 'Outros', valor: 2600 },
]
