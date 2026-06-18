'use client'

export interface Produto {
  id: string
  nome: string
  descricao: string
  valor_litro: number
  status: 'ativo' | 'inativo'
  data_vigencia: string   // YYYY-MM-DD
  data_alteracao: string  // ISO datetime
  usuario: string
}

export interface HistoricoPreco {
  id: string
  produto_id: string
  produto_nome: string
  valor_anterior: number
  novo_valor: number
  data_alteracao: string  // ISO datetime
  usuario: string
  motivo: string
  data_vigencia: string   // YYYY-MM-DD
}

export interface Embalagem {
  id: string
  nome: string
  volume: number // litros
}

export interface BarcadaLinha {
  embalagem_id: string
  embalagem_nome: string
  volume_litros: number
  num_pacotes: number
  litros_calculados: number
  valor_litro: number
  total: number
}

export interface Barcada {
  id: string
  numero: string
  data: string           // DD/MM/YYYY
  fornecedor: string
  produto_id: string
  produto_nome: string   // snapshot at creation
  valor_litro_historico: number // snapshot at creation
  num_caixas: number
  linhas: BarcadaLinha[]
  total_pacotes: number
  total_litros: number
  valor_total: number
  responsavel: string
  observacoes: string
  created_at: string
}

const PRODUTOS_KEY = 'acai_produtos'
const HISTORICO_KEY = 'acai_historico_precos'
const BARCADAS_KEY = 'acai_barcadas'
const EMBALAGENS_KEY = 'acai_embalagens'

const PRODUTOS_DEFAULT: Produto[] = [
  { id: 'prod1', nome: 'Açaí Popular', descricao: 'Açaí popular', valor_litro: 12, status: 'ativo', data_vigencia: '2026-01-01', data_alteracao: new Date().toISOString(), usuario: 'admin' },
  { id: 'prod2', nome: 'Açaí Médio', descricao: 'Açaí médio', valor_litro: 15, status: 'ativo', data_vigencia: '2026-01-01', data_alteracao: new Date().toISOString(), usuario: 'admin' },
  { id: 'prod3', nome: 'Açaí Grosso', descricao: 'Açaí grosso', valor_litro: 18, status: 'ativo', data_vigencia: '2026-01-01', data_alteracao: new Date().toISOString(), usuario: 'admin' },
  { id: 'prod4', nome: 'Açaí Grosso Papa', descricao: 'Açaí grosso papa', valor_litro: 20, status: 'ativo', data_vigencia: '2026-01-01', data_alteracao: new Date().toISOString(), usuario: 'admin' },
]

const EMBALAGENS_DEFAULT: Embalagem[] = [
  { id: 'emb1', nome: '1/2 litro', volume: 0.5 },
  { id: 'emb2', nome: '1 litro', volume: 1.0 },
]

function load<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : def
  } catch { return def }
}

function save<T>(key: string, data: T) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(data))
}

export function getProdutos(): Produto[] { return load(PRODUTOS_KEY, PRODUTOS_DEFAULT) }
export function setProdutos(p: Produto[]) { save(PRODUTOS_KEY, p) }

export function getHistorico(): HistoricoPreco[] { return load(HISTORICO_KEY, []) }
export function setHistorico(h: HistoricoPreco[]) { save(HISTORICO_KEY, h) }

export function getEmbalagens(): Embalagem[] { return load(EMBALAGENS_KEY, EMBALAGENS_DEFAULT) }
export function setEmbalagens(e: Embalagem[]) { save(EMBALAGENS_KEY, e) }

export function getBarcadas(): Barcada[] { return load(BARCADAS_KEY, []) }
export function setBarcadas(b: Barcada[]) { save(BARCADAS_KEY, b) }
