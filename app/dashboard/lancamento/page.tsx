'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { loadEntries, saveEntry, updateEntry, deleteEntry, upsertEntries, type DailyEntry } from '@/lib/dailyData'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const empty = (): Omit<DailyEntry, 'id' | 'litros_cx' | 'custo_litro' | 'lucro_total' | 'media_lucro_cx'> => ({
  data: new Date().toLocaleDateString('pt-BR'),
  cxs: 0, valor_total: 0, litros: 0,
  valor_litros: 0, venda_acai: 0,
  farinha_tapioca: 0, camarao: 0, gastos: 0,
})

function calc(f: ReturnType<typeof empty>): DailyEntry {
  const litros_cx = f.cxs > 0 && f.litros > 0 ? f.litros / f.cxs : 0
  const custo_litro = f.litros > 0 ? f.valor_total / f.litros : 0
  const lucro_total = f.valor_litros - f.valor_total
  const media_lucro_cx = f.cxs > 0 && lucro_total > 0 ? lucro_total / f.cxs : 0
  return { id: f.data, ...f, litros_cx, custo_litro, lucro_total, media_lucro_cx }
}

function R(v: number) {
  return v === 0 ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function N(v: number, dec = 2) {
  return v === 0 ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function AcaiIcon() {
  return (
    <img
      src="/acai-icon.png"
      alt="açaí"
      width={30}
      height={30}
      style={{ objectFit: 'contain' }}
    />
  )
}

function parseDate(d: string) {
  const [day, month, year] = d.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export default function LancamentoDiarioPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadEntries().then(e => { setEntries(e); setLoading(false) }) }, [])
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<DailyEntry | null>(null)
  const [form, setForm] = useState(empty())
  const [filterMonth, setFilterMonth] = useState('')
  const [tab, setTab] = useState<'tabela' | 'graficos' | 'resumo'>('tabela')
  const [search, setSearch] = useState('')
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function normalizeDate(raw: string): string | null {
    const s = String(raw ?? '').trim().replace(/['"]/g, '')
    if (!s) return null
    // Already DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s
    // DD/MM/YY
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
      const [d, m, y] = s.split('/')
      return `${d}/${m}/20${y}`
    }
    // M/D/YY or M/D/YYYY (Excel US format — this planilha uses 1/2/26)
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
      const parts = s.split('/')
      const m = parts[0].padStart(2, '0')
      const d = parts[1].padStart(2, '0')
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
      return `${d}/${m}/${y}`
    }
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-')
      return `${d}/${m}/${y}`
    }
    // Excel serial number
    const num = parseInt(s)
    if (!isNaN(num) && num > 1000 && num < 100000) {
      const d = new Date(Date.UTC(1899, 11, 30) + num * 86400000)
      return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`
    }
    return null
  }

  function cleanNum(v: string): number {
    // Remove R$, spaces, then handle thousand/decimal separators
    // Format: "R$ 4,620.00" (US) or "R$ 4.620,00" (BR)
    const s = String(v ?? '').replace(/R\$\s*/g, '').replace(/\s/g, '').trim()
    if (!s) return 0
    // If has both . and , — determine which is decimal
    if (s.includes('.') && s.includes(',')) {
      const lastDot = s.lastIndexOf('.')
      const lastComma = s.lastIndexOf(',')
      if (lastDot > lastComma) {
        // US format: 4,620.00 → remove commas
        return parseFloat(s.replace(/,/g, '')) || 0
      } else {
        // BR format: 4.620,00 → remove dots, replace comma
        return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
      }
    }
    if (s.includes(',') && !s.includes('.')) return parseFloat(s.replace(',', '.')) || 0
    return parseFloat(s) || 0
  }

  function parseRows(rows: unknown[][]): DailyEntry[] {
    const imported: DailyEntry[] = []
    // Find first data row: skip all rows until we find one where col[0] looks like a date
    let start = 0
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const cell = String(rows[i]?.[0] ?? '').trim()
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(cell) || /^\d{5}$/.test(cell)) {
        start = i; break
      }
    }
    for (let i = start; i < rows.length; i++) {
      const cols = (rows[i] ?? []).map((c: unknown) => String(c ?? '').trim().replace(/['"]/g, ''))
      if (!cols[0]) continue
      const data = normalizeDate(cols[0])
      if (!data) continue
      const cxs = cleanNum(cols[1])
      const valor_total = cleanNum(cols[2])
      const litros = cleanNum(cols[3])
      // Cols 4,5 are auto-calc (litros/cx, custo/litro) — skip
      const valor_litros = cleanNum(cols[6])
      // Col 7 = lucro (auto), col 8 = media (auto) — skip
      const venda_acai = cleanNum(cols[9])
      const farinha_tapioca = cleanNum(cols[10])
      const camarao = cleanNum(cols[11])
      const gastos = cleanNum(cols[12])
      const litros_cx = cxs > 0 && litros > 0 ? litros / cxs : 0
      const custo_litro = litros > 0 ? valor_total / litros : 0
      const lucro_total = valor_litros - valor_total
      const media_lucro_cx = cxs > 0 && lucro_total > 0 ? lucro_total / cxs : 0
      imported.push({ id: data, data, cxs, valor_total, litros, litros_cx, custo_litro, valor_litros, lucro_total, media_lucro_cx, venda_acai, farinha_tapioca, camarao, gastos })
    }
    return imported
  }

  async function applyImport(imported: DailyEntry[]) {
    if (imported.length === 0) {
      setImportMsg({ type: 'err', text: 'Nenhum registro encontrado. Verifique se a planilha tem a coluna DATA no formato DD/MM/AAAA.' })
      return
    }
    setImportMsg({ type: 'ok', text: `⏳ Enviando ${imported.length} registros para o banco...` })
    const count = await upsertEntries(imported)
    const refreshed = await loadEntries()
    setEntries(refreshed)
    setImportMsg({ type: 'ok', text: `✅ ${count} registros importados/atualizados com sucesso!` })
    setTimeout(() => setImportMsg(null), 6000)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return

    const isExcel = /\.(xlsx|xls)$/i.test(file.name)

    if (isExcel) {
      // Use SheetJS for Excel files
      import('xlsx').then(XLSX => {
        const reader = new FileReader()
        reader.onload = ev => {
          try {
            const data = new Uint8Array(ev.target?.result as ArrayBuffer)
            const wb = XLSX.read(data, { type: 'array' })
            const ws = wb.Sheets[wb.SheetNames[0]]
            // raw:true → números como números, datas como serial do Excel
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' }) as unknown[][]
            applyImport(parseRows(rows))
          } catch {
            setImportMsg({ type: 'err', text: 'Erro ao ler o arquivo Excel. Verifique se não está corrompido.' })
          }
        }
        reader.readAsArrayBuffer(file)
      })
    } else {
      // CSV / TXT / TSV
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const text = ev.target?.result as string
          const lines = text.split(/\r?\n/).filter(l => l.trim())
          const rows = lines.map(l => l.split(/[;,\t]/))
          applyImport(parseRows(rows))
        } catch {
          setImportMsg({ type: 'err', text: 'Erro ao processar o arquivo. Use CSV com separador ; , ou Tab.' })
        }
      }
      reader.readAsText(file, 'UTF-8')
    }
  }

  // computed preview
  const preview = calc(form)

  function openNew() {
    setForm(empty())
    setEditEntry(null)
    setShowForm(true)
  }

  function openEdit(entry: DailyEntry) {
    setForm({ data: entry.data, cxs: entry.cxs, valor_total: entry.valor_total, litros: entry.litros, valor_litros: entry.valor_litros, venda_acai: entry.venda_acai, farinha_tapioca: entry.farinha_tapioca, camarao: entry.camarao, gastos: entry.gastos })
    setEditEntry(entry)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const entry = calc(form)
    if (editEntry) {
      await updateEntry(editEntry.id, entry)
      setEntries(prev => prev.map(x => x.id === editEntry.id ? { ...entry, id: editEntry.id } : x))
    } else {
      const saved = await saveEntry(entry)
      if (saved) {
        setEntries(prev => [saved, ...prev.filter(x => x.data !== entry.data)].sort((a, b) => parseDate(b.data).getTime() - parseDate(a.data).getTime()))
      }
    }
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirmar exclusão deste registro?')) return
    await deleteEntry(id)
    setEntries(prev => prev.filter(x => x.id !== id))
  }

  function setF(key: keyof typeof form, value: number | string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  // Filter
  const filtered = useMemo(() => {
    let r = entries
    if (filterMonth) r = r.filter(e => e.data.includes(`/${filterMonth}/`))
    if (search) r = r.filter(e => e.data.includes(search))
    return r
  }, [entries, filterMonth, search])

  // Aggregates
  const totals = useMemo(() => ({
    cxs: filtered.reduce((s, e) => s + e.cxs, 0),
    valor_total: filtered.reduce((s, e) => s + e.valor_total, 0),
    litros: filtered.reduce((s, e) => s + e.litros, 0),
    valor_litros: filtered.reduce((s, e) => s + e.valor_litros, 0),
    lucro_total: filtered.reduce((s, e) => s + e.lucro_total, 0),
    venda_acai: filtered.reduce((s, e) => s + e.venda_acai, 0),
    farinha_tapioca: filtered.reduce((s, e) => s + e.farinha_tapioca, 0),
    camarao: filtered.reduce((s, e) => s + e.camarao, 0),
    gastos: filtered.reduce((s, e) => s + e.gastos, 0),
    dias_producao: filtered.filter(e => e.cxs > 0).length,
    receita_total: filtered.reduce((s, e) => s + e.venda_acai + e.farinha_tapioca + e.camarao, 0),
  }), [filtered])

  // Chart data by month
  const chartData = useMemo(() => {
    const byMonth: Record<string, { mes: string; lucro: number; venda: number; custo: number; cxs: number }> = {}
    entries.forEach(e => {
      const [, m, y] = e.data.split('/')
      const key = `${months[Number(m) - 1]}/${y?.slice(2)}`
      if (!byMonth[key]) byMonth[key] = { mes: key, lucro: 0, venda: 0, custo: 0, cxs: 0 }
      byMonth[key].lucro += e.lucro_total
      byMonth[key].venda += e.venda_acai + e.farinha_tapioca + e.camarao
      byMonth[key].custo += e.valor_total
      byMonth[key].cxs += e.cxs
    })
    return Object.values(byMonth)
  }, [entries])

  // month options
  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { const [, m, y] = e.data.split('/'); set.add(`${m}/${y}`) })
    return Array.from(set).sort()
  }, [entries])

  const cols = [
    'DATA', 'CXS', 'VALOR TOTAL', 'LITROS', 'L/CX', 'CUSTO/L',
    'VALOR LITROS', 'LUCRO TOTAL', 'MÉDIA/CX', 'VENDA AÇAÍ',
    'FARINHA/TAP.', 'CAMARÃO', 'GASTOS', ''
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '📅', label: 'Dias c/ produção', value: `${totals.dias_producao}`, sub: `de ${filtered.length} dias` },
            { icon: '📦', label: 'Total Caixas', value: N(totals.cxs, 1) },
            { icon: '🫐', label: 'Total Litros', value: `${N(totals.litros, 0)}L` },
            { icon: '💵', label: 'Custo Total Açaí', value: R(totals.valor_total), color: '#D32F2F' },
            { icon: '🛒', label: 'Venda Açaí (cx)', value: R(totals.venda_acai), color: '#2E7D32' },
            { icon: '💰', label: 'Lucro Total', value: R(totals.lucro_total), color: '#2E7D32' },
            { icon: '🌾', label: 'Farinha/Tapioca', value: R(totals.farinha_tapioca) },
            { icon: '🦐', label: 'Camarão', value: R(totals.camarao) },
            { icon: '📋', label: 'Gastos', value: R(totals.gastos), color: '#D32F2F' },
            { icon: '📈', label: 'Receita Total', value: R(totals.receita_total), color: '#5B145F' },
          ].map((c, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: 22, marginBottom: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 30 }}>
                {c.icon === 'acai'
                  ? <AcaiIcon />
                  : c.icon
                }
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: c.color ?? '#3B0A45', lineHeight: 1.1 }}>{c.value}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>{c.label}</div>
              {c.sub && <div style={{ fontSize: 10, color: '#C4B5D0' }}>{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 3, background: '#F4E8F7', padding: 3, borderRadius: 10 }}>
            {(['tabela', 'graficos', 'resumo'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === t ? 'white' : 'transparent', color: tab === t ? '#5B145F' : '#9CA3AF', transition: 'all 0.18s' }}>
                {t === 'tabela' ? '📋 Tabela' : t === 'graficos' ? '📊 Gráficos' : '📈 Resumo'}
              </button>
            ))}
          </div>

          {/* Filters */}
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '7px 12px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 12, color: '#374151' }}>
            <option value="">Todos os meses</option>
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <input placeholder="🔍 Buscar data (dd/mm/yyyy)" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 12px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 12, minWidth: 200 }} />

          <div style={{ flex: 1 }} />
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt,.tsv" style={{ display: 'none' }} onChange={handleImportFile} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: '1.5px solid #7A2E83', background: 'white', color: '#7A2E83', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F9F4FB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white' }}
          >
            📤 Importar Planilha
          </button>
          <button className="btn-primary" onClick={openNew}>+ Novo Lançamento</button>
        </div>

        {importMsg && (
          <div style={{ marginBottom: 14, padding: '10px 16px', borderRadius: 10, background: importMsg.type === 'ok' ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${importMsg.type === 'ok' ? '#A5D6A7' : '#FFCDD2'}`, fontSize: 13, fontWeight: 600, color: importMsg.type === 'ok' ? '#2E7D32' : '#C62828' }}>
            {importMsg.text}
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#3B0A45', margin: 0 }}>
                  {editEntry ? `✏️ Editar — ${editEntry.data}` : '📝 Novo Lançamento Diário'}
                </h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9CA3AF' }}>×</button>
              </div>

              <form onSubmit={handleSave}>
                {/* Section: Produção */}
                <div style={{ background: '#F4E8F7', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#5B145F', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>🫐 Produção</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <Field label="Data" type="text" placeholder="DD/MM/AAAA" value={form.data} onChange={v => setF('data', v)} required />
                    <Field label="Caixas (CXS)" type="number" placeholder="0" value={form.cxs || ''} onChange={v => setF('cxs', Number(v))} step="0.5" />
                    <Field label="Valor Total (R$)" type="number" placeholder="0,00" value={form.valor_total || ''} onChange={v => setF('valor_total', Number(v))} step="0.01" />
                    <Field label="Litros Produzidos" type="number" placeholder="0" value={form.litros || ''} onChange={v => setF('litros', Number(v))} step="0.5" />
                  </div>
                </div>

                {/* Auto-calculated preview */}
                {(form.cxs > 0 || form.litros > 0) && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, background: '#EDE7F6', borderRadius: 12, padding: '12px 16px' }}>
                    {[
                      ['Litros/Cx', preview.litros_cx > 0 ? N(preview.litros_cx) : '—'],
                      ['Custo/Litro', preview.custo_litro > 0 ? R(preview.custo_litro) : '—'],
                      ['Lucro Total', preview.lucro_total !== 0 ? R(preview.lucro_total) : '—'],
                      ['Média/Cx', preview.media_lucro_cx > 0 ? R(preview.media_lucro_cx) : '—'],
                    ].map(([l, v]) => (
                      <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#7A2E83', fontWeight: 700, marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#3B0A45' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section: Vendas */}
                <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#2E7D32', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>💰 Receitas</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <Field label="Valor Litros (R$)" type="number" placeholder="0,00" value={form.valor_litros || ''} onChange={v => setF('valor_litros', Number(v))} step="0.01" />
                    <Field label="Venda Açaí (R$)" type="number" placeholder="0,00" value={form.venda_acai || ''} onChange={v => setF('venda_acai', Number(v))} step="0.01" />
                    <Field label="Farinha/Tapioca (R$)" type="number" placeholder="0,00" value={form.farinha_tapioca || ''} onChange={v => setF('farinha_tapioca', Number(v))} step="0.01" />
                    <Field label="Camarão (R$)" type="number" placeholder="0,00" value={form.camarao || ''} onChange={v => setF('camarao', Number(v))} step="0.01" />
                  </div>
                </div>

                {/* Section: Gastos */}
                <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#F57F17', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>📋 Gastos do Dia</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <Field label="Gastos (R$)" type="number" placeholder="0,00" value={form.gastos || ''} onChange={v => setF('gastos', Number(v))} step="0.01" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                    💾 {editEntry ? 'Salvar Alterações' : 'Salvar Lançamento'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABLE TAB */}
        {tab === 'tabela' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #3B0A45, #5B145F)', color: 'white' }}>
                  {cols.map((c, i) => (
                    <th key={i} style={{ padding: '10px 10px', textAlign: i >= 2 ? 'right' : 'left', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.3 }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, ri) => {
                  const semProd = row.cxs === 0
                  const destaque = row.lucro_total > 3000
                  const baixoRend = row.cxs > 0 && row.litros_cx < 14
                  return (
                    <tr key={row.id} style={{ background: semProd ? '#FFF8E1' : ri % 2 === 0 ? 'white' : '#FAFAFA', borderBottom: '1px solid #F0EAF5', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F9F4FB')}
                      onMouseLeave={e => (e.currentTarget.style.background = semProd ? '#FFF8E1' : ri % 2 === 0 ? 'white' : '#FAFAFA')}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#3B0A45', whiteSpace: 'nowrap' }}>{row.data}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: semProd ? 400 : 700, color: semProd ? '#9CA3AF' : '#374151' }}>{row.cxs > 0 ? N(row.cxs, 1) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#D32F2F', fontWeight: 600 }}>{row.valor_total > 0 ? R(row.valor_total) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#5B145F', fontWeight: 600 }}>{row.litros > 0 ? `${N(row.litros, 1)}L` : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: baixoRend ? '#D32F2F' : '#374151' }}>{row.litros_cx > 0 ? N(row.litros_cx) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#374151' }}>{row.custo_litro > 0 ? R(row.custo_litro) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#7A2E83', fontWeight: 600 }}>{row.valor_litros > 0 ? R(row.valor_litros) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: row.lucro_total > 0 ? '#2E7D32' : row.lucro_total < 0 ? '#D32F2F' : '#9CA3AF' }}>
                        {row.lucro_total !== 0 ? R(row.lucro_total) : '—'}
                        {destaque && <span style={{ marginLeft: 4, fontSize: 10 }}>⭐</span>}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#374151' }}>{row.media_lucro_cx > 0 ? R(row.media_lucro_cx) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2E7D32', fontWeight: 600 }}>{row.venda_acai > 0 ? R(row.venda_acai) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#1565C0' }}>{row.farinha_tapioca > 0 ? R(row.farinha_tapioca) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#E65100' }}>{row.camarao > 0 ? R(row.camarao) : '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#D32F2F' }}>{row.gastos > 0 ? R(row.gastos) : '—'}</td>
                      <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => openEdit(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginRight: 2 }} title="Editar">✏️</button>
                        <button onClick={() => handleDelete(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Excluir">🗑️</button>
                      </td>
                    </tr>
                  )
                })}

                {/* Totals row */}
                <tr style={{ background: 'linear-gradient(135deg, #3B0A45, #5B145F)', color: 'white', fontWeight: 800 }}>
                  <td style={{ padding: '10px 10px', fontSize: 12 }}>TOTAL</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{N(totals.cxs, 1)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.valor_total)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{N(totals.litros, 0)}L</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{totals.litros > 0 && totals.cxs > 0 ? N(totals.litros / totals.cxs) : '—'}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{totals.litros > 0 ? R(totals.valor_total / totals.litros) : '—'}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.valor_litros)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.lucro_total)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{totals.cxs > 0 ? R(totals.lucro_total / totals.cxs) : '—'}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.venda_acai)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.farinha_tapioca)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.camarao)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12 }}>{R(totals.gastos)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 8, fontSize: 11, color: '#9CA3AF' }}>
              {filtered.length} registros · Linhas amarelas = dias sem produção · ⭐ = lucro &gt; R$ 3.000
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {tab === 'graficos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>Lucro Total por Mês</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: unknown) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))} />
                  <Legend />
                  <Bar dataKey="lucro" fill="#2E7D32" name="Lucro" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="custo" fill="#D32F2F" name="Custo Açaí" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="venda" fill="#7A2E83" name="Venda (cx)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>Caixas Processadas por Mês</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cxs" stroke="#7A2E83" strokeWidth={2} dot name="Caixas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {tab === 'resumo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* By month */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>📅 Resumo por Mês</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F4E8F7' }}>
                    {['Mês', 'Cxs', 'Custo', 'Venda Cx', 'Lucro', 'Gastos'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: h === 'Mês' ? 'left' : 'right', fontSize: 10, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F9F4FB' }}>
                      <td style={{ padding: '8px 8px', fontWeight: 700, color: '#5B145F' }}>{row.mes}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>{N(row.cxs, 1)}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#D32F2F' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.custo)}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#2E7D32' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.venda)}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 800, color: row.lucro > 0 ? '#2E7D32' : '#D32F2F' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.lucro)}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#D32F2F' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entries.filter(e => e.data.includes(`/${row.mes.split('/')[0] === 'Jan' ? '01' : row.mes.split('/')[0] === 'Fev' ? '02' : row.mes.split('/')[0] === 'Mar' ? '03' : row.mes.split('/')[0] === 'Abr' ? '04' : row.mes.split('/')[0] === 'Mai' ? '05' : '06'}/`)).reduce((s, e) => s + e.gastos, 0)) }</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top days */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>🏆 Top 10 Dias de Maior Lucro</div>
              {[...entries].filter(e => e.cxs > 0).sort((a, b) => b.lucro_total - a.lucro_total).slice(0, 10).map((row, i) => (
                <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 9 ? '1px solid #F4E8F7' : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? ['#7A2E83', '#9C4BA3', '#B565B0'][i] : '#F4E8F7', color: i < 3 ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>{row.data}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{N(row.cxs, 1)} cx · {N(row.litros, 0)}L</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#2E7D32' }}>{R(row.lucro_total)}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{R(row.media_lucro_cx)}/cx</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable field component
function Field({ label, type, placeholder, value, onChange, required, step }: { label: string; type: string; placeholder?: string; value: string | number; onChange: (v: string) => void; required?: boolean; step?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        step={step}
        style={{ width: '100%', padding: '9px 11px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 13, fontWeight: 500 }}
        onFocus={e => (e.target.style.borderColor = '#7A2E83')}
        onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
      />
    </div>
  )
}
