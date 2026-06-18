'use client'
import { useState, useEffect, useMemo } from 'react'
import { loadEntries, type DailyEntry } from '@/lib/dailyData'
import { formatCurrency } from '@/lib/utils'

interface ExpenseRow {
  id: string
  date: string          // DD/MM/YYYY
  category: string
  description: string
  amount: number
  origem: 'planilha' | 'manual'
}

const categories = ['Gastos operacionais', 'Farinha / Tapioca', 'Camarão', 'Compra de açaí', 'Embalagens', 'Gelo', 'Energia', 'Mão de obra', 'Aluguel', 'Outros']
const catColors: Record<string, string> = {
  'Gastos operacionais': 'badge-yellow', 'Farinha / Tapioca': 'badge-blue', 'Camarão': 'badge-red',
  'Compra de açaí': 'badge-purple', 'Embalagens': 'badge-blue', 'Mão de obra': 'badge-green', 'Aluguel': 'badge-gray',
}
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function parseBR(d: string) {
  const [day, m, y] = d.split('/')
  return new Date(Number(y), Number(m) - 1, Number(day))
}
function monthKey(d: string) {
  const [, m, y] = d.split('/')
  return `${y}-${m}`
}

// Build expense rows from the base spreadsheet (daily_entries): gastos, farinha/tapioca, camarão
function deriveFromEntries(entries: DailyEntry[]): ExpenseRow[] {
  const rows: ExpenseRow[] = []
  for (const e of entries) {
    if (e.gastos > 0) rows.push({ id: `g-${e.data}`, date: e.data, category: 'Gastos operacionais', description: 'Gastos operacionais do dia', amount: e.gastos, origem: 'planilha' })
    if (e.farinha_tapioca > 0) rows.push({ id: `f-${e.data}`, date: e.data, category: 'Farinha / Tapioca', description: 'Compra de farinha / tapioca', amount: e.farinha_tapioca, origem: 'planilha' })
    if (e.camarao > 0) rows.push({ id: `c-${e.data}`, date: e.data, category: 'Camarão', description: 'Compra de camarão', amount: e.camarao, origem: 'planilha' })
  }
  return rows
}

export default function DespesasPage() {
  const [planilha, setPlanilha] = useState<ExpenseRow[]>([])
  const [manuais, setManuais] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: new Date().toLocaleDateString('pt-BR'), category: 'Embalagens', description: '', amount: '' })

  useEffect(() => {
    loadEntries().then(e => { setPlanilha(deriveFromEntries(e)); setLoading(false) })
  }, [])

  const all = useMemo(() => {
    const merged = [...manuais, ...planilha]
    const filtered = filterMonth ? merged.filter(r => monthKey(r.date) === filterMonth) : merged
    return filtered.sort((a, b) => parseBR(b.date).getTime() - parseBR(a.date).getTime())
  }, [manuais, planilha, filterMonth])

  const monthOptions = useMemo(() => {
    const set = new Set([...planilha, ...manuais].map(r => monthKey(r.date)))
    return Array.from(set).sort().reverse()
  }, [planilha, manuais])

  const total = all.reduce((s, e) => s + e.amount, 0)
  const dias = new Set(all.map(e => e.date)).size
  const byCategory = categories
    .map(cat => ({ cat, total: all.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const exp: ExpenseRow = {
      id: `m${Date.now()}`,
      date: form.date,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      origem: 'manual',
    }
    setManuais(prev => [exp, ...prev])
    setShowForm(false)
    setForm({ date: new Date().toLocaleDateString('pt-BR'), category: 'Embalagens', description: '', amount: '' })
  }

  function removeManual(id: string) {
    setManuais(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { icon: '💸', label: 'Total do Período', value: formatCurrency(total), accent: '#DC2626' },
            { icon: '📋', label: 'Registros', value: `${all.length}`, accent: '#7A2E83' },
            { icon: '📦', label: 'Maior Categoria', value: byCategory[0]?.cat ?? '—', accent: '#0891B2' },
            { icon: '📊', label: 'Custo/Dia Médio', value: dias > 0 ? formatCurrency(total / dias) : '—', accent: '#D97706' },
          ].map((card, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.06)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.accent }} />
              <div style={{ width: 34, height: 34, borderRadius: 9, background: card.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 8, marginTop: 2 }}>{card.icon}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1F1235', lineHeight: 1.1 }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>Registros de Despesas</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                  <option value="">Todos os meses</option>
                  {monthOptions.map(mk => {
                    const [y, m] = mk.split('-')
                    return <option key={mk} value={mk}>{months[Number(m) - 1]}/{y}</option>
                  })}
                </select>
                <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nova Despesa</button>
              </div>
            </div>

            {showForm && (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 16px' }}>Nova Despesa</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Data (DD/MM/AAAA)</label>
                      <input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Categoria</label>
                      <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Descrição</label>
                      <input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Valor (R$)</label>
                      <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn-primary">💾 Salvar</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                      {['Data', 'Categoria', 'Descrição', 'Origem', 'Valor', ''].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Carregando despesas da planilha…</td></tr>
                    )}
                    {!loading && all.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Nenhuma despesa no período.</td></tr>
                    )}
                    {all.map(e => (
                      <tr key={e.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                        <td style={{ padding: '12px 14px', color: '#6B7280' }}>{e.date}</td>
                        <td style={{ padding: '12px 14px' }}><span className={`badge ${catColors[e.category] ?? 'badge-gray'}`}>{e.category}</span></td>
                        <td style={{ padding: '12px 14px', fontWeight: 500 }}>{e.description}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: e.origem === 'planilha' ? '#7A2E83' : '#0891B2' }}>
                            {e.origem === 'planilha' ? '📄 Planilha' : '✍️ Manual'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#D32F2F' }}>{formatCurrency(e.amount)}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {e.origem === 'manual' && (
                            <button onClick={() => removeManual(e.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 9px', color: '#DC2626', fontSize: 12, cursor: 'pointer' }}>🗑️</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Por Categoria</div>
            {byCategory.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>Sem dados.</div>}
            {byCategory.map(item => (
              <div key={item.cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, color: '#374151' }}>{item.cat}</span>
                  <span style={{ fontWeight: 700, color: '#D32F2F' }}>{formatCurrency(item.total)}</span>
                </div>
                <div style={{ height: 5, background: '#F0EAF5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${total > 0 ? (item.total / total) * 100 : 0}%`, height: '100%', background: '#7A2E83', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{total > 0 ? ((item.total / total) * 100).toFixed(1) : '0'}% do total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
