export type UserRole = 'admin' | 'gerente' | 'producao' | 'vendedor' | 'caixa' | 'consulta'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  phone: string
  location: string
  supply_type: string
  avg_price_per_box: number
  rating: number
  notes: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  customer_type: 'consumidor_final' | 'revendedor' | 'restaurante' | 'mercado' | 'outro'
  notes: string
  created_at: string
}

export interface Batch {
  id: string
  batch_number: string
  date: string
  supplier_id: string
  supplier_name: string
  boxes_quantity: number
  total_liters: number
  total_cost: number
  cost_per_box: number
  cost_per_liter: number
  yield_per_box: number
  acai_type: string
  status: 'aberta' | 'em_producao' | 'envasada' | 'finalizada'
  responsible_user_id?: string
  responsible_name: string
  notes: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  volume_liters: number
  sale_price: number
  minimum_stock: number
  current_stock: number
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface PackagingRecord {
  id: string
  batch_id: string
  batch_number: string
  product_id: string
  product_name: string
  date: string
  quantity: number
  volume_per_unit: number
  total_liters: number
  responsible_name: string
  notes: string
  created_at: string
}

export type MovementType = 'entrada' | 'venda' | 'perda' | 'doacao' | 'consumo_interno' | 'ajuste'

export interface StockMovement {
  id: string
  product_id: string
  product_name: string
  movement_type: MovementType
  origin_type: string
  quantity_units: number
  quantity_liters: number
  reason: string
  responsible_name: string
  created_at: string
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito' | 'fiado' | 'transferencia' | 'cortesia' | 'doacao'

export interface SaleItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount: number
  total: number
  liters_total: number
}

export interface Sale {
  id: string
  sale_date: string
  customer_id?: string
  customer_name?: string
  seller_name: string
  items: SaleItem[]
  gross_total: number
  discount_total: number
  net_total: number
  payment_method: PaymentMethod
  status: 'ativa' | 'cancelada'
  notes: string
  created_at: string
}

export interface CashSession {
  id: string
  opening_date: string
  closing_date?: string
  operator_name: string
  opening_amount: number
  expected_amount: number
  informed_amount: number
  difference_amount: number
  total_cash: number
  total_pix: number
  total_debit: number
  total_credit: number
  total_fiado: number
  total_discounts: number
  total_expenses: number
  total_sangria: number
  status: 'aberto' | 'conferido' | 'divergencia' | 'pendente'
  notes: string
  created_at: string
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  payment_method: string
  supplier_name?: string
  notes: string
  created_at: string
}

export interface Alert {
  id: string
  type: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'success'
  status: 'ativo' | 'resolvido'
  created_at: string
}
