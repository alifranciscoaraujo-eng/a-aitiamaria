import { supabase } from './supabase'

export interface ComposicaoLinha {
  produto_id: string
  produto_nome: string
  valor_litro: number
  pacotes_meio: number   // pacotes de 1/2 litro
  pacotes_um: number     // pacotes de 1 litro
}

export interface DailyEntry {
  id: string
  data: string           // DD/MM/YYYY
  cxs: number
  valor_total: number
  litros: number
  litros_cx: number
  custo_litro: number
  valor_litros: number
  lucro_total: number
  media_lucro_cx: number
  venda_acai: number
  farinha_tapioca: number
  camarao: number
  gastos: number
  composicao?: ComposicaoLinha[]
}

function isoToBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function brToISO(br: string): string {
  const [d, m, y] = br.split('/')
  return `${y}-${m}-${d}`
}

function rowToEntry(row: Record<string, unknown>): DailyEntry {
  return {
    id: String(row.id),
    data: isoToBR(String(row.data)),
    cxs: Number(row.cxs) || 0,
    valor_total: Number(row.valor_total) || 0,
    litros: Number(row.litros) || 0,
    litros_cx: Number(row.litros_cx) || 0,
    custo_litro: Number(row.custo_litro) || 0,
    valor_litros: Number(row.valor_litros) || 0,
    lucro_total: Number(row.lucro_total) || 0,
    media_lucro_cx: Number(row.lucro_medio_cx) || 0,
    venda_acai: Number(row.venda_acai) || 0,
    farinha_tapioca: Number(row.farinha_tapioca) || 0,
    camarao: Number(row.camarao) || 0,
    gastos: Number(row.gastos) || 0,
    composicao: Array.isArray(row.composicao) ? (row.composicao as ComposicaoLinha[]) : undefined,
  }
}

export async function loadEntries(): Promise<DailyEntry[]> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .order('data', { ascending: true })
  if (error || !data) return []
  return data.map(rowToEntry)
}

export async function saveEntry(entry: Omit<DailyEntry, 'id'>): Promise<DailyEntry | null> {
  const { data, error } = await supabase
    .from('daily_entries')
    .insert({
      data: brToISO(entry.data),
      cxs: entry.cxs,
      valor_total: entry.valor_total,
      litros: entry.litros,
      litros_cx: entry.litros_cx,
      custo_litro: entry.custo_litro,
      valor_litros: entry.valor_litros,
      lucro_total: entry.lucro_total,
      lucro_medio_cx: entry.media_lucro_cx,
      venda_acai: entry.venda_acai,
      farinha_tapioca: entry.farinha_tapioca,
      camarao: entry.camarao,
      gastos: entry.gastos,
      composicao: entry.composicao ?? null,
    })
    .select()
    .single()
  if (error || !data) return null
  return rowToEntry(data)
}

export async function updateEntry(id: string, entry: Partial<DailyEntry>): Promise<boolean> {
  const patch: Record<string, unknown> = {}
  if (entry.data) patch.data = brToISO(entry.data)
  if (entry.cxs !== undefined) patch.cxs = entry.cxs
  if (entry.valor_total !== undefined) patch.valor_total = entry.valor_total
  if (entry.litros !== undefined) patch.litros = entry.litros
  if (entry.litros_cx !== undefined) patch.litros_cx = entry.litros_cx
  if (entry.custo_litro !== undefined) patch.custo_litro = entry.custo_litro
  if (entry.valor_litros !== undefined) patch.valor_litros = entry.valor_litros
  if (entry.lucro_total !== undefined) patch.lucro_total = entry.lucro_total
  if (entry.media_lucro_cx !== undefined) patch.lucro_medio_cx = entry.media_lucro_cx
  if (entry.venda_acai !== undefined) patch.venda_acai = entry.venda_acai
  if (entry.farinha_tapioca !== undefined) patch.farinha_tapioca = entry.farinha_tapioca
  if (entry.camarao !== undefined) patch.camarao = entry.camarao
  if (entry.gastos !== undefined) patch.gastos = entry.gastos
  if (entry.composicao !== undefined) patch.composicao = entry.composicao ?? null
  const { error } = await supabase.from('daily_entries').update(patch).eq('id', id)
  return !error
}

export async function deleteEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from('daily_entries').delete().eq('id', id)
  return !error
}

export async function upsertEntries(entries: Omit<DailyEntry, 'id'>[]): Promise<number> {
  const rows = entries.map(e => ({
    data: brToISO(e.data),
    cxs: e.cxs,
    valor_total: e.valor_total,
    litros: e.litros,
    litros_cx: e.litros_cx,
    custo_litro: e.custo_litro,
    valor_litros: e.valor_litros,
    lucro_total: e.lucro_total,
    lucro_medio_cx: e.media_lucro_cx,
    venda_acai: e.venda_acai,
    farinha_tapioca: e.farinha_tapioca,
    camarao: e.camarao,
    gastos: e.gastos,
  }))
  const { error, data: inserted } = await supabase
    .from('daily_entries')
    .upsert(rows, { onConflict: 'data' })
    .select('id')
  if (error) return 0
  return inserted?.length ?? rows.length
}

export const dailyEntries: DailyEntry[] = []
