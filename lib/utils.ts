export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function formatLiters(value: number): string {
  return `${value.toFixed(1)}L`
}

export const paymentMethodLabel: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  debito: 'Débito',
  credito: 'Crédito',
  fiado: 'Fiado',
  transferencia: 'Transferência',
  cortesia: 'Cortesia',
  doacao: 'Doação',
}

export const movementTypeLabel: Record<string, string> = {
  entrada: 'Entrada',
  venda: 'Venda',
  perda: 'Perda',
  doacao: 'Doação',
  consumo_interno: 'Consumo Interno',
  ajuste: 'Ajuste',
}

export const movementTypeColor: Record<string, string> = {
  entrada: 'badge-green',
  venda: 'badge-blue',
  perda: 'badge-red',
  doacao: 'badge-purple',
  consumo_interno: 'badge-yellow',
  ajuste: 'badge-gray',
}

export const batchStatusLabel: Record<string, string> = {
  aberta: 'Aberta',
  em_producao: 'Em Produção',
  envasada: 'Envasada',
  finalizada: 'Finalizada',
}

export const batchStatusColor: Record<string, string> = {
  aberta: 'badge-gray',
  em_producao: 'badge-yellow',
  envasada: 'badge-blue',
  finalizada: 'badge-green',
}

export const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  producao: 'Produção',
  vendedor: 'Vendedor',
  caixa: 'Caixa',
  consulta: 'Consulta',
}

export const customerTypeLabel: Record<string, string> = {
  consumidor_final: 'Consumidor Final',
  revendedor: 'Revendedor',
  restaurante: 'Restaurante',
  mercado: 'Mercado',
  outro: 'Outro',
}
