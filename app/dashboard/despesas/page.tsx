'use client'
import { useState } from 'react'
import { mockExpenses } from '@/lib/mockData'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense } from '@/lib/types'

const categories = ['Compra de açaí', 'Embalagens', 'Gelo', 'Energia', 'Água', 'Combustível', 'Frete', 'Mão de obra', 'Manutenção', 'Taxas de cartão', 'Aluguel', 'Marketing', 'Outros']
const catColors: Record<string, string> = {
  'Compra de açaí': 'badge-purple', 'Embalagens': 'badge-blue', 'Gelo': 'badge-blue', 'Energia': 'badge-yellow',
  'Mão de obra': 'badge-green', 'Aluguel': 'badge-red', 'Combustível': 'badge-yellow', 'Manutenção': 'badge-red',
}

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Embalagens', description: '', amount: '', payment_method: 'pix', supplier_name: '', notes: '' })

  const totalMonth = expenses.reduce((s, e) => s + e.amount, 0)
  const byCategory = categories.map(cat => ({ cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const exp: Expense = {
      id: `e${Date.now()}`,
      date: form.date,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      payment_method: form.payment_method,
      supplier_name: form.supplier_name || undefined,
      notes: form.notes,
      created_at: new Date().toISOString(),
    }
    setExpenses(prev => [exp, ...prev])
    setShowForm(false)
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Embalagens', description: '', amount: '', payment_method: 'pix', supplier_name: '', notes: '' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { icon: '💸', label: 'Total do Período', value: formatCurrency(totalMonth) },
            { icon: '📋', label: 'Registros', value: `${expenses.length}` },
            { icon: '📦', label: 'Maior Gasto', value: byCategory[0]?.cat ?? '—' },
            { icon: '📊', label: 'Custo/Dia Médio', value: formatCurrency(totalMonth / 7) },
          ].map((card, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#3B0A45' }}>{card.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{card.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>Registros de Despesas</span>
              <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nova Despesa</button>
            </div>

            {showForm && (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 16px' }}>Nova Despesa</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Data</label>
                      <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
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
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Pagamento</label>
                      <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                        {['dinheiro', 'pix', 'debito', 'transferencia'].map(pm => <option key={pm} value={pm}>{pm}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Fornecedor</label>
                      <input value={form.supplier_name} onChange={e => setForm(p => ({ ...p, supplier_name: e.target.value }))} placeholder="Opcional" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                    {['Data', 'Categoria', 'Descrição', 'Fornecedor', 'Pagamento', 'Valor'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                      <td style={{ padding: '12px 14px', color: '#6B7280' }}>{formatDate(e.date)}</td>
                      <td style={{ padding: '12px 14px' }}><span className={`badge ${catColors[e.category] ?? 'badge-gray'}`}>{e.category}</span></td>
                      <td style={{ padding: '12px 14px', fontWeight: 500 }}>{e.description}</td>
                      <td style={{ padding: '12px 14px', color: '#6B7280' }}>{e.supplier_name ?? '—'}</td>
                      <td style={{ padding: '12px 14px', color: '#6B7280', textTransform: 'capitalize' }}>{e.payment_method}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#D32F2F' }}>{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Por Categoria</div>
            {byCategory.map(item => (
              <div key={item.cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, color: '#374151' }}>{item.cat}</span>
                  <span style={{ fontWeight: 700, color: '#D32F2F' }}>{formatCurrency(item.total)}</span>
                </div>
                <div style={{ height: 5, background: '#F0EAF5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(item.total / totalMonth) * 100}%`, height: '100%', background: '#7A2E83', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{((item.total / totalMonth) * 100).toFixed(1)}% do total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
