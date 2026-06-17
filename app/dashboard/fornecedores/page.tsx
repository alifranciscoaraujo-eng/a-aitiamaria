'use client'
import { useState } from 'react'
import { mockSuppliers, mockBatches } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/lib/types'

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', location: '', supply_type: 'Açaí in natura', avg_price_per_box: '', notes: '' })

  function getBatches(id: string) { return mockBatches.filter(b => b.supplier_id === id) }
  function getTotalBoxes(id: string) { return getBatches(id).reduce((s, b) => s + b.boxes_quantity, 0) }
  function getTotalLiters(id: string) { return getBatches(id).reduce((s, b) => s + b.total_liters, 0) }
  function getAvgCostPerLiter(id: string) {
    const batches = getBatches(id)
    if (!batches.length) return 0
    return batches.reduce((s, b) => s + b.cost_per_liter, 0) / batches.length
  }
  function getAvgYield(id: string) {
    const batches = getBatches(id)
    if (!batches.length) return 0
    return batches.reduce((s, b) => s + b.yield_per_box, 0) / batches.length
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const s: Supplier = {
      id: `s${Date.now()}`,
      name: form.name,
      phone: form.phone,
      location: form.location,
      supply_type: form.supply_type,
      avg_price_per_box: Number(form.avg_price_per_box),
      rating: 3,
      notes: form.notes,
      created_at: new Date().toISOString(),
    }
    setSuppliers(prev => [...prev, s])
    setShowForm(false)
    setForm({ name: '', phone: '', location: '', supply_type: 'Açaí in natura', avg_price_per_box: '', notes: '' })
  }

  const acaiSuppliers = suppliers.filter(s => s.supply_type.includes('Açaí'))
    .map(s => ({ ...s, totalLiters: getTotalLiters(s.id), avgCost: getAvgCostPerLiter(s.id), avgYield: getAvgYield(s.id) }))
    .sort((a, b) => b.totalLiters - a.totalLiters)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { icon: '🚛', label: `${suppliers.length} Fornecedores` },
              { icon: '🫐', label: `${suppliers.filter(s => s.supply_type.includes('Açaí')).length} de açaí` },
            ].map((s, i) => (
              <div key={i} style={{ background: '#F4E8F7', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#5B145F' }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Novo Fornecedor</button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 16px' }}>Novo Fornecedor</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Nome', key: 'name', required: true },
                  { label: 'Telefone', key: 'phone' },
                  { label: 'Localidade', key: 'location' },
                  { label: 'Preço médio/caixa (R$)', key: 'avg_price_per_box', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                    <input required={f.required} type={f.type ?? 'text'} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Tipo de Fornecimento</label>
                  <select value={form.supply_type} onChange={e => setForm(p => ({ ...p, supply_type: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {['Açaí in natura', 'Embalagens e potes', 'Gelo', 'Outros'].map(t => <option key={t}>{t}</option>)}
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

        {/* Ranking */}
        {acaiSuppliers.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>🏆 Ranking de Fornecedores de Açaí</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {acaiSuppliers.slice(0, 3).map((s, i) => (
                <div key={s.id} style={{ background: ['#F4E8F7', '#F9F4FB', '#FAF5FB'][i], borderRadius: 14, padding: 18, border: `2px solid ${['#7A2E83', '#D1C4E9', '#EDE7F6'][i]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: ['#7A2E83', '#9C4BA3', '#B565B0'][i], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#7A2E83' }}>📍 {s.location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      ['Volume', `${s.totalLiters}L`],
                      ['Custo/L', formatCurrency(s.avgCost)],
                      ['Rend./Cx', `${s.avgYield.toFixed(1)}L`],
                      ['Avaliação', '⭐'.repeat(s.rating)],
                    ].map(([l, v]) => (
                      <div key={l} style={{ background: 'white', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#3B0A45' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4E8F7', fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>Todos os Fornecedores</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                {['Nome', 'Localidade', 'Tipo', 'Preço/Cx', 'Caixas', 'Litros', 'Custo/L', 'Rend./Cx', 'Avaliação', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{s.name}</td>
                  <td style={{ padding: '12px 14px', color: '#6B7280' }}>{s.location}</td>
                  <td style={{ padding: '12px 14px' }}><span className="badge badge-purple">{s.supply_type}</span></td>
                  <td style={{ padding: '12px 14px' }}>{s.avg_price_per_box > 0 ? formatCurrency(s.avg_price_per_box) : '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>{getTotalBoxes(s.id) || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#7A2E83' }}>{getTotalLiters(s.id) > 0 ? `${getTotalLiters(s.id)}L` : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{getAvgCostPerLiter(s.id) > 0 ? formatCurrency(getAvgCostPerLiter(s.id)) : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{getAvgYield(s.id) > 0 ? `${getAvgYield(s.id).toFixed(1)}L` : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{'⭐'.repeat(s.rating)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => setSelected(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3B0A45', margin: 0 }}>🚛 {selected.name}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  ['Localidade', selected.location],
                  ['Telefone', selected.phone],
                  ['Tipo', selected.supply_type],
                  ['Preço/Caixa', formatCurrency(selected.avg_price_per_box)],
                  ['Total de Caixas', `${getTotalBoxes(selected.id)}`],
                  ['Total de Litros', `${getTotalLiters(selected.id)}L`],
                  ['Custo Médio/Litro', formatCurrency(getAvgCostPerLiter(selected.id))],
                  ['Rend. Médio/Cx', `${getAvgYield(selected.id).toFixed(1)}L`],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#F9F4FB', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{v}</div>
                  </div>
                ))}
              </div>
              {selected.notes && <div style={{ background: '#FFF8E1', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#6B7280', marginBottom: 14 }}>📝 {selected.notes}</div>}
              <button onClick={() => setSelected(null)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
