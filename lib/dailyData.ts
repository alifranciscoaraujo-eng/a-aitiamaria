export interface DailyEntry {
  id: string
  data: string           // DD/MM/YYYY
  cxs: number            // caixas
  valor_total: number    // custo compra açaí
  litros: number         // litros produzidos
  litros_cx: number      // litros por caixa (auto)
  custo_litro: number    // custo por litro (auto)
  valor_litros: number   // valor de venda dos litros
  lucro_total: number    // lucro (auto: valor_litros - valor_total)
  media_lucro_cx: number // média lucro/cx (auto)
  venda_acai: number     // caixa recebido venda açaí
  farinha_tapioca: number
  camarao: number
  gastos: number
}

const STORAGE_KEY = 'acai_daily_entries'

export function loadEntries(): DailyEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEntries(entries: DailyEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export const dailyEntries: DailyEntry[] = []
