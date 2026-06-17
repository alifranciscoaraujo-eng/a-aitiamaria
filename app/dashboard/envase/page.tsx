'use client'
import { useState } from 'react'
import { mockPackaging, mockBatches, mockProducts } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'
import type { PackagingRecord } from '@/lib/types'

export default function EnvasePage() {
  const [records, setRecords] = useState<PackagingRecord[]>(mockPackaging)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ batch_id: 'b1', product_id: 'p1', date: new Date().toISOString().split('T')[0], quantity: '', notes: '' })

  const product = mockProducts.find(p => p.id === form.product_id)
  const qty = Number(form.quantity) || 0
  const totalLiters = qty * (product?.volume_liters ?? 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const batch = mockBatches.find(b => b.id === form.batch_id)
    const rec: PackagingRecord = {
      id: `pkg${Date.now()}`,
      batch_id: form.batch_id,
      batch_number: batch?.batch_number ?? '',
      product_id: form.product_id,
      product_name: product?.name ?? '',
      date: form.date,
      quantity: qty,
      volume_per_unit: product?.volume_liters ?? 0,
      total_liters: totalLiters,
      responsible_name: 'Carlos Oliveira',
      notes: form.notes,
      created_at: new Date().toISOString(),
    }
    setRecords(prev => [rec, ...prev])
    setShowForm(false)
    setForm({ batch_id: 'b1', product_id: 'p1', date: new Date().toISOString().split('T')[0], quantity: '', notes: '' })
  }

  const totalUnits = records.reduce((s, r) => s + r.quantity, 0)
  const totalLitersAll = records.reduce((s, r) => s + r.total_liters, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: `${records.length} Registros`, icon: '📋' },
              { label: `${totalUnits} Pacotes`, icon: '📦' },
              { label: `${totalLitersAll.toFixed(0)}L Envasados`, icon: '💧' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#F4E8F7', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#5B145F' }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Registrar Envase</button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 20px' }}>📦 Novo Envase</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Data</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Barcada</label>
                  <select value={form.batch_id} onChange={e => setForm(p => ({ ...p, batch_id: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {mockBatches.map(b => <option key={b.id} value={b.id}>{b.batch_number} — {b.total_liters}L</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Produto</label>
                  <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.volume_liters}L)</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Quantidade de Pacotes</label>
                  <input type="number" placeholder="100" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 8px' }}>
                  <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>Volume por unidade</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#3B0A45' }}>{product?.volume_liters ?? 0}L</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 8px' }}>
                  <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>Total de litros</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2E7D32' }}>{totalLiters.toFixed(1)}L</div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">💾 Salvar Envase</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4E8F7', fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>Registros de Envase</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                {['Data', 'Barcada', 'Produto', 'Qtd. Pacotes', 'Volume/Un', 'Total Litros', 'Responsável'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                  <td style={{ padding: '12px 14px' }}>{formatDate(r.date)}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#5B145F' }}>{r.batch_number}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>{r.product_name}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{r.quantity}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>{r.volume_per_unit}L</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7A2E83' }}>{r.total_liters.toFixed(1)}L</td>
                  <td style={{ padding: '12px 14px', color: '#6B7280' }}>{r.responsible_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
