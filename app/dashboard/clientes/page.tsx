'use client'
import { useState } from 'react'
import { mockCustomers, mockSales } from '@/lib/mockData'
import { formatCurrency, customerTypeLabel } from '@/lib/utils'
import type { Customer } from '@/lib/types'

const typeColors: Record<string, string> = {
  consumidor_final: 'badge-blue', revendedor: 'badge-purple', restaurante: 'badge-green', mercado: 'badge-yellow', outro: 'badge-gray'
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', customer_type: 'consumidor_final' as Customer['customer_type'], notes: '' })
  const [search, setSearch] = useState('')

  function getCustomerRevenue(id: string) {
    return mockSales.filter(s => s.customer_id === id && s.status === 'ativa').reduce((s, v) => s + v.net_total, 0)
  }
  function getCustomerOrders(id: string) {
    return mockSales.filter(s => s.customer_id === id && s.status === 'ativa').length
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const c: Customer = { id: `c${Date.now()}`, ...form, created_at: new Date().toISOString() }
    setCustomers(prev => [c, ...prev])
    setShowForm(false)
    setForm({ name: '', phone: '', address: '', customer_type: 'consumidor_final', notes: '' })
  }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <input placeholder="🔍 Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, minWidth: 240 }} />
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Novo Cliente</button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 16px' }}>Novo Cliente</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Nome', key: 'name', required: true },
                  { label: 'Telefone', key: 'phone' },
                  { label: 'Endereço', key: 'address' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                    <input required={f.required} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Tipo</label>
                  <select value={form.customer_type} onChange={e => setForm(p => ({ ...p, customer_type: e.target.value as Customer['customer_type'] }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {Object.entries(customerTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">💾 Salvar</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setSelected(c)}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,20,95,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #5B145F, #7A2E83)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>
                  {c.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{c.phone}</div>
                </div>
                <span className={`badge ${typeColors[c.customer_type] ?? 'badge-gray'}`}>{customerTypeLabel[c.customer_type]}</span>
              </div>
              {c.address && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>📍 {c.address}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, textAlign: 'center', background: '#F4E8F7', borderRadius: 8, padding: '8px 0' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#5B145F' }}>{getCustomerOrders(c.id)}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>pedidos</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: '#E8F5E9', borderRadius: 8, padding: '8px 0' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#2E7D32' }}>{formatCurrency(getCustomerRevenue(c.id))}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>compras</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3B0A45', margin: 0 }}>👥 {selected.name}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Tipo', customerTypeLabel[selected.customer_type]],
                  ['Telefone', selected.phone || '—'],
                  ['Endereço', selected.address || '—'],
                  ['Total de Pedidos', `${getCustomerOrders(selected.id)}`],
                  ['Total em Compras', formatCurrency(getCustomerRevenue(selected.id))],
                  ['Ticket Médio', getCustomerOrders(selected.id) > 0 ? formatCurrency(getCustomerRevenue(selected.id) / getCustomerOrders(selected.id)) : '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#F9F4FB', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', wordBreak: 'break-word' }}>{v}</div>
                  </div>
                ))}
              </div>
              {selected.notes && <div style={{ background: '#FFF8E1', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>📝 {selected.notes}</div>}
              <button onClick={() => setSelected(null)} className="btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
