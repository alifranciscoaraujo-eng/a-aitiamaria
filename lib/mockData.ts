import type { User, Supplier, Customer, Batch, Product, PackagingRecord, StockMovement, Sale, SaleItem, CashSession, Expense, Alert } from './types'

export const mockUsers: User[] = [
  { id: 'u1', name: 'Maria da Silva', email: 'maria@acaitiamaria.com', role: 'admin', status: 'ativo', created_at: '2024-01-01' },
  { id: 'u2', name: 'João Santos', email: 'joao@acaitiamaria.com', role: 'gerente', status: 'ativo', created_at: '2024-01-15' },
  { id: 'u3', name: 'Ana Lima', email: 'ana@acaitiamaria.com', role: 'vendedor', status: 'ativo', created_at: '2024-02-01' },
  { id: 'u4', name: 'Carlos Oliveira', email: 'carlos@acaitiamaria.com', role: 'producao', status: 'ativo', created_at: '2024-02-10' },
  { id: 'u5', name: 'Fernanda Costa', email: 'fernanda@acaitiamaria.com', role: 'caixa', status: 'ativo', created_at: '2024-03-01' },
]

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Açaí do Raimundo', phone: '(91) 98765-4321', location: 'Igarapé-Miri, PA', supply_type: 'Açaí in natura', avg_price_per_box: 120, rating: 5, notes: 'Fornecedor principal, produto de alta qualidade', created_at: '2024-01-01' },
  { id: 's2', name: 'Palmas Açaí', phone: '(91) 97654-3210', location: 'Moju, PA', supply_type: 'Açaí in natura', avg_price_per_box: 110, rating: 4, notes: 'Bom rendimento por caixa', created_at: '2024-01-10' },
  { id: 's3', name: 'Frutos da Amazônia', phone: '(91) 96543-2109', location: 'Abaetetuba, PA', supply_type: 'Açaí in natura', avg_price_per_box: 130, rating: 4, notes: 'Açaí premium, preço mais alto', created_at: '2024-02-01' },
  { id: 's4', name: 'Embalagens Norte', phone: '(91) 95432-1098', location: 'Belém, PA', supply_type: 'Embalagens e potes', avg_price_per_box: 0, rating: 4, notes: 'Fornecedor de embalagens', created_at: '2024-01-05' },
  { id: 's5', name: 'Gelo Real', phone: '(91) 94321-0987', location: 'Belém, PA', supply_type: 'Gelo', avg_price_per_box: 0, rating: 3, notes: 'Entrega diária de gelo', created_at: '2024-01-05' },
]

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Restaurante Sabor Paraense', phone: '(91) 93210-9876', address: 'Av. Nazaré, 500, Belém', customer_type: 'restaurante', notes: 'Compra toda semana', created_at: '2024-01-15' },
  { id: 'c2', name: 'Mercadinho São João', phone: '(91) 92109-8765', address: 'Rua das Flores, 200, Belém', customer_type: 'mercado', notes: 'Revende nosso açaí', created_at: '2024-02-01' },
  { id: 'c3', name: 'Ana Paula Rodrigues', phone: '(91) 91098-7654', address: 'Travessa Leal, 45, Belém', customer_type: 'consumidor_final', notes: 'Cliente fiel há 2 anos', created_at: '2024-02-10' },
  { id: 'c4', name: 'Distribuidora Açaí Prime', phone: '(91) 90987-6543', address: 'Rod. BR-316, km 12, Belém', customer_type: 'revendedor', notes: 'Compra grande quantidade', created_at: '2024-03-01' },
  { id: 'c5', name: 'Carlos Mendes', phone: '(91) 89876-5432', address: 'Conjunto Júlia Seffer, Belém', customer_type: 'consumidor_final', notes: '', created_at: '2024-03-15' },
]

export const mockBatches: Batch[] = [
  { id: 'b1', batch_number: 'BARC-001', date: '2026-06-16', supplier_id: 's1', supplier_name: 'Açaí do Raimundo', boxes_quantity: 20, total_liters: 280, total_cost: 2400, cost_per_box: 120, cost_per_liter: 8.57, yield_per_box: 14, acai_type: 'Açaí médio', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: 'Barcada do dia, excelente qualidade', created_at: '2026-06-16T06:00:00' },
  { id: 'b2', batch_number: 'BARC-002', date: '2026-06-16', supplier_id: 's2', supplier_name: 'Palmas Açaí', boxes_quantity: 15, total_liters: 195, total_cost: 1650, cost_per_box: 110, cost_per_liter: 8.46, yield_per_box: 13, acai_type: 'Açaí grosso', status: 'envasada', responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-16T08:00:00' },
  { id: 'b3', batch_number: 'BARC-003', date: '2026-06-15', supplier_id: 's1', supplier_name: 'Açaí do Raimundo', boxes_quantity: 18, total_liters: 252, total_cost: 2160, cost_per_box: 120, cost_per_liter: 8.57, yield_per_box: 14, acai_type: 'Açaí médio', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-15T06:00:00' },
  { id: 'b4', batch_number: 'BARC-004', date: '2026-06-14', supplier_id: 's3', supplier_name: 'Frutos da Amazônia', boxes_quantity: 10, total_liters: 150, total_cost: 1300, cost_per_box: 130, cost_per_liter: 8.67, yield_per_box: 15, acai_type: 'Açaí premium', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: 'Lote premium para restaurantes', created_at: '2026-06-14T06:00:00' },
  { id: 'b5', batch_number: 'BARC-005', date: '2026-06-13', supplier_id: 's2', supplier_name: 'Palmas Açaí', boxes_quantity: 25, total_liters: 325, total_cost: 2750, cost_per_box: 110, cost_per_liter: 8.46, yield_per_box: 13, acai_type: 'Açaí fino', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-13T06:00:00' },
  { id: 'b6', batch_number: 'BARC-006', date: '2026-06-12', supplier_id: 's1', supplier_name: 'Açaí do Raimundo', boxes_quantity: 22, total_liters: 308, total_cost: 2640, cost_per_box: 120, cost_per_liter: 8.57, yield_per_box: 14, acai_type: 'Açaí médio', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-12T06:00:00' },
  { id: 'b7', batch_number: 'BARC-007', date: '2026-06-11', supplier_id: 's3', supplier_name: 'Frutos da Amazônia', boxes_quantity: 12, total_liters: 180, total_cost: 1560, cost_per_box: 130, cost_per_liter: 8.67, yield_per_box: 15, acai_type: 'Açaí premium', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-11T06:00:00' },
  { id: 'b8', batch_number: 'BARC-008', date: '2026-06-10', supplier_id: 's2', supplier_name: 'Palmas Açaí', boxes_quantity: 20, total_liters: 260, total_cost: 2200, cost_per_box: 110, cost_per_liter: 8.46, yield_per_box: 13, acai_type: 'Açaí médio', status: 'finalizada', responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-10T06:00:00' },
]

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

export const mockSales: Sale[] = [
  { id: 'v1', sale_date: '2026-06-16T08:30:00', customer_name: 'Ana Paula Rodrigues', seller_name: 'Ana Lima', items: [{ id: 'i1', product_id: 'p2', product_name: 'Açaí 1 Litro', quantity: 3, unit_price: 15, discount: 0, total: 45, liters_total: 3 }, { id: 'i2', product_id: 'p1', product_name: 'Açaí 500ml', quantity: 2, unit_price: 8, discount: 0, total: 16, liters_total: 1 }], gross_total: 61, discount_total: 0, net_total: 61, payment_method: 'pix', status: 'ativa', notes: '', created_at: '2026-06-16T08:30:00' },
  { id: 'v2', sale_date: '2026-06-16T09:15:00', customer_name: 'Restaurante Sabor Paraense', seller_name: 'Ana Lima', items: [{ id: 'i3', product_id: 'p4', product_name: 'Açaí 5 Litros', quantity: 4, unit_price: 65, discount: 5, total: 255, liters_total: 20 }], gross_total: 260, discount_total: 5, net_total: 255, payment_method: 'pix', status: 'ativa', notes: 'Cliente fixo', created_at: '2026-06-16T09:15:00' },
  { id: 'v3', sale_date: '2026-06-16T10:00:00', customer_name: undefined, seller_name: 'Ana Lima', items: [{ id: 'i4', product_id: 'p1', product_name: 'Açaí 500ml', quantity: 5, unit_price: 8, discount: 0, total: 40, liters_total: 2.5 }], gross_total: 40, discount_total: 0, net_total: 40, payment_method: 'dinheiro', status: 'ativa', notes: '', created_at: '2026-06-16T10:00:00' },
  { id: 'v4', sale_date: '2026-06-16T10:45:00', customer_name: 'Carlos Mendes', seller_name: 'Ana Lima', items: [{ id: 'i5', product_id: 'p2', product_name: 'Açaí 1 Litro', quantity: 2, unit_price: 15, discount: 0, total: 30, liters_total: 2 }], gross_total: 30, discount_total: 0, net_total: 30, payment_method: 'debito', status: 'ativa', notes: '', created_at: '2026-06-16T10:45:00' },
  { id: 'v5', sale_date: '2026-06-16T11:20:00', customer_name: 'Mercadinho São João', seller_name: 'Ana Lima', items: [{ id: 'i6', product_id: 'p3', product_name: 'Açaí 2 Litros', quantity: 5, unit_price: 28, discount: 0, total: 140, liters_total: 10 }, { id: 'i7', product_id: 'p2', product_name: 'Açaí 1 Litro', quantity: 3, unit_price: 15, discount: 0, total: 45, liters_total: 3 }], gross_total: 185, discount_total: 0, net_total: 185, payment_method: 'fiado', status: 'ativa', notes: 'Paga sexta-feira', created_at: '2026-06-16T11:20:00' },
  { id: 'v6', sale_date: '2026-06-16T12:00:00', customer_name: undefined, seller_name: 'Ana Lima', items: [{ id: 'i8', product_id: 'p5', product_name: 'Açaí Grosso 1L', quantity: 2, unit_price: 18, discount: 0, total: 36, liters_total: 2 }], gross_total: 36, discount_total: 0, net_total: 36, payment_method: 'pix', status: 'ativa', notes: '', created_at: '2026-06-16T12:00:00' },
  { id: 'v7', sale_date: '2026-06-16T13:30:00', customer_name: 'Distribuidora Açaí Prime', seller_name: 'Ana Lima', items: [{ id: 'i9', product_id: 'p10', product_name: 'Açaí 10 Litros', quantity: 3, unit_price: 120, discount: 10, total: 350, liters_total: 30 }], gross_total: 360, discount_total: 10, net_total: 350, payment_method: 'transferencia', status: 'ativa', notes: '', created_at: '2026-06-16T13:30:00' },
  { id: 'v8', sale_date: '2026-06-16T14:15:00', customer_name: undefined, seller_name: 'Ana Lima', items: [{ id: 'i10', product_id: 'p1', product_name: 'Açaí 500ml', quantity: 4, unit_price: 8, discount: 0, total: 32, liters_total: 2 }], gross_total: 32, discount_total: 0, net_total: 32, payment_method: 'dinheiro', status: 'ativa', notes: '', created_at: '2026-06-16T14:15:00' },
]

export const mockPackaging: PackagingRecord[] = [
  { id: 'pkg1', batch_id: 'b1', batch_number: 'BARC-001', product_id: 'p2', product_name: 'Açaí 1 Litro', date: '2026-06-16', quantity: 80, volume_per_unit: 1, total_liters: 80, responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-16T07:00:00' },
  { id: 'pkg2', batch_id: 'b1', batch_number: 'BARC-001', product_id: 'p1', product_name: 'Açaí 500ml', date: '2026-06-16', quantity: 120, volume_per_unit: 0.5, total_liters: 60, responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-16T07:30:00' },
  { id: 'pkg3', batch_id: 'b1', batch_number: 'BARC-001', product_id: 'p3', product_name: 'Açaí 2 Litros', date: '2026-06-16', quantity: 30, volume_per_unit: 2, total_liters: 60, responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-16T08:00:00' },
  { id: 'pkg4', batch_id: 'b2', batch_number: 'BARC-002', product_id: 'p5', product_name: 'Açaí Grosso 1L', date: '2026-06-16', quantity: 60, volume_per_unit: 1, total_liters: 60, responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-16T09:00:00' },
  { id: 'pkg5', batch_id: 'b2', batch_number: 'BARC-002', product_id: 'p8', product_name: 'Açaí 500ml Grosso', date: '2026-06-16', quantity: 50, volume_per_unit: 0.5, total_liters: 25, responsible_name: 'Carlos Oliveira', notes: '', created_at: '2026-06-16T09:30:00' },
]

export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', product_id: 'p2', product_name: 'Açaí 1 Litro', movement_type: 'entrada', origin_type: 'envase', quantity_units: 80, quantity_liters: 80, reason: 'Envase BARC-001', responsible_name: 'Carlos Oliveira', created_at: '2026-06-16T07:00:00' },
  { id: 'sm2', product_id: 'p1', product_name: 'Açaí 500ml', movement_type: 'entrada', origin_type: 'envase', quantity_units: 120, quantity_liters: 60, reason: 'Envase BARC-001', responsible_name: 'Carlos Oliveira', created_at: '2026-06-16T07:30:00' },
  { id: 'sm3', product_id: 'p2', product_name: 'Açaí 1 Litro', movement_type: 'venda', origin_type: 'venda', quantity_units: 5, quantity_liters: 5, reason: 'Venda V001', responsible_name: 'Ana Lima', created_at: '2026-06-16T08:30:00' },
  { id: 'sm4', product_id: 'p4', product_name: 'Açaí 5 Litros', movement_type: 'venda', origin_type: 'venda', quantity_units: 4, quantity_liters: 20, reason: 'Venda V002', responsible_name: 'Ana Lima', created_at: '2026-06-16T09:15:00' },
  { id: 'sm5', product_id: 'p1', product_name: 'Açaí 500ml', movement_type: 'perda', origin_type: 'ajuste', quantity_units: 3, quantity_liters: 1.5, reason: 'Pote danificado', responsible_name: 'Carlos Oliveira', created_at: '2026-06-16T10:00:00' },
  { id: 'sm6', product_id: 'p2', product_name: 'Açaí 1 Litro', movement_type: 'doacao', origin_type: 'ajuste', quantity_units: 2, quantity_liters: 2, reason: 'Doação para creche municipal', responsible_name: 'Maria da Silva', created_at: '2026-06-16T11:00:00' },
  { id: 'sm7', product_id: 'p6', product_name: 'Açaí Fino 1L', movement_type: 'consumo_interno', origin_type: 'ajuste', quantity_units: 1, quantity_liters: 1, reason: 'Degustação para clientes', responsible_name: 'Ana Lima', created_at: '2026-06-16T12:00:00' },
]

export const mockExpenses: Expense[] = [
  { id: 'e1', date: '2026-06-16', category: 'Compra de açaí', description: 'Compra barcada BARC-001', amount: 2400, payment_method: 'transferencia', supplier_name: 'Açaí do Raimundo', notes: '', created_at: '2026-06-16T06:00:00' },
  { id: 'e2', date: '2026-06-16', category: 'Compra de açaí', description: 'Compra barcada BARC-002', amount: 1650, payment_method: 'transferencia', supplier_name: 'Palmas Açaí', notes: '', created_at: '2026-06-16T08:00:00' },
  { id: 'e3', date: '2026-06-16', category: 'Gelo', description: 'Gelo para produção do dia', amount: 80, payment_method: 'dinheiro', supplier_name: 'Gelo Real', notes: '', created_at: '2026-06-16T06:30:00' },
  { id: 'e4', date: '2026-06-16', category: 'Embalagens', description: 'Potes e tampas', amount: 150, payment_method: 'dinheiro', supplier_name: 'Embalagens Norte', notes: '', created_at: '2026-06-16T07:00:00' },
  { id: 'e5', date: '2026-06-15', category: 'Energia', description: 'Conta de energia elétrica', amount: 320, payment_method: 'pix', notes: '', created_at: '2026-06-15T10:00:00' },
  { id: 'e6', date: '2026-06-15', category: 'Mão de obra', description: 'Pagamento diária produção', amount: 200, payment_method: 'dinheiro', notes: '', created_at: '2026-06-15T17:00:00' },
  { id: 'e7', date: '2026-06-14', category: 'Combustível', description: 'Gasolina entrega', amount: 120, payment_method: 'dinheiro', notes: '', created_at: '2026-06-14T14:00:00' },
  { id: 'e8', date: '2026-06-13', category: 'Embalagens', description: 'Sacolas e etiquetas', amount: 85, payment_method: 'pix', supplier_name: 'Embalagens Norte', notes: '', created_at: '2026-06-13T09:00:00' },
  { id: 'e9', date: '2026-06-12', category: 'Manutenção', description: 'Reparo na despolpadeira', amount: 350, payment_method: 'pix', notes: '', created_at: '2026-06-12T11:00:00' },
  { id: 'e10', date: '2026-06-10', category: 'Aluguel', description: 'Aluguel do espaço - junho', amount: 1200, payment_method: 'transferencia', notes: '', created_at: '2026-06-10T08:00:00' },
]

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

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'stock_low', title: 'Estoque baixo: Açaí Fino 1L', description: 'Apenas 8 unidades em estoque (mínimo: 20)', severity: 'warning', status: 'ativo', created_at: '2026-06-16T09:00:00' },
  { id: 'a2', type: 'stock_low', title: 'Estoque baixo: Polpa Açaí 400g', description: 'Apenas 12 unidades em estoque (mínimo: 25)', severity: 'warning', status: 'ativo', created_at: '2026-06-16T09:00:00' },
  { id: 'a3', type: 'batch_no_packaging', title: 'Barcada BARC-002 sem envase completo', description: 'Barcada processada mas com envase pendente', severity: 'info', status: 'ativo', created_at: '2026-06-16T10:00:00' },
  { id: 'a4', type: 'loss_high', title: 'Perda registrada hoje', description: '3 unidades de Açaí 500ml perdidas por dano', severity: 'warning', status: 'ativo', created_at: '2026-06-16T10:00:00' },
  { id: 'a5', type: 'cash_open', title: 'Caixa em aberto', description: 'Caixa do dia ainda não foi fechado', severity: 'info', status: 'ativo', created_at: '2026-06-16T07:00:00' },
]

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
