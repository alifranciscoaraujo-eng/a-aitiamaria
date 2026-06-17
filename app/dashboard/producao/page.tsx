'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { mockBatches, mockSuppliers } from '@/lib/mockData'
import { formatCurrency, formatDate, batchStatusLabel, batchStatusColor } from '@/lib/utils'
import type { Batch } from '@/lib/types'

const initialForm = {
  date: new Date().toISOString().split('T')[0],
  supplier_id: 's1',
  boxes_quantity: '',
  total_liters: '',
  total_cost: '',
  acai_type: 'Açaí médio',
  notes: '',
}

export default function ProducaoPage() {
  const [batches, setBatches] = useState<Batch[]>(mockBatches)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [selected, setSelected] = useState<Batch | null>(null)

  const boxes = Number(form.boxes_quantity) || 0
  const liters = Number(form.total_liters) || 0
  const cost = Number(form.total_cost) || 0
  const costPerBox = boxes > 0 ? cost / boxes : 0
  const costPerLiter = liters > 0 ? cost / liters : 0
  const yieldPerBox = boxes > 0 ? liters / boxes : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supplier = mockSuppliers.find(s => s.id === form.supplier_id)
    const newBatch: Batch = {
      id: `b${Date.now()}`,
      batch_number: `BARC-00${batches.length + 1}`,
      date: form.date,
      supplier_id: form.supplier_id,
      supplier_name: supplier?.name ?? '',
      boxes_quantity: boxes,
      total_liters: liters,
      total_cost: cost,
      cost_per_box: costPerBox,
      cost_per_liter: costPerLiter,
      yield_per_box: yieldPerBox,
      acai_type: form.acai_type,
      status: 'aberta',
      responsible_name: 'Carlos Oliveira',
      notes: form.notes,
      created_at: new Date().toISOString(),
    }
    setBatches(prev => [newBatch, ...prev])
    setForm(initialForm)
    setShowForm(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="Produção / Barcadas" />
      <div style={{ padding: 24 }}>

        {/* Header actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: `${batches.length} Barcadas`, icon: '🫐' },
              { label: `${batches.reduce((s,b) => s + b.boxes_quantity, 0)} Caixas`, icon: '📦' },
              { label: `${batches.reduce((s,b) => s + b.total_liters, 0)}L Produzidos`, icon: '💧' },
              { label: formatCurrency(batches.reduce((s,b) => s + b.total_cost, 0)), icon: '💰' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#F4E8F7', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#5B145F', display: 'flex', alignItems: 'center', gap: 6 }}>
                {stat.icon} {stat.label}
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nova Barcada</button>
        </div>

        {/* New Batch Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 20px' }}>Nova Barcada</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Data', key: 'date', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                    <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Fornecedor</label>
                  <select value={form.supplier_id} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {mockSuppliers.filter(s => s.supply_type.includes('Açaí')).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Tipo de Açaí</label>
                  <select value={form.acai_type} onChange={e => setForm(p => ({ ...p, acai_type: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {['Açaí médio', 'Açaí grosso', 'Açaí fino', 'Açaí premium'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {[
                  { label: 'Qtd. Caixas', key: 'boxes_quantity', placeholder: '20' },
                  { label: 'Total de Litros', key: 'total_liters', placeholder: '280' },
                  { label: 'Custo Total (R$)', key: 'total_cost', placeholder: '2400' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                    <input type="number" placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                ))}
              </div>

              {/* Auto-calculated */}
              {(boxes > 0 && liters > 0 && cost > 0) && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '12px 16px', background: '#F4E8F7', borderRadius: 12 }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>Custo/Caixa</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#3B0A45' }}>{formatCurrency(costPerBox)}</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>Custo/Litro</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#3B0A45' }}>{formatCurrency(costPerLiter)}</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>Rendimento/Caixa</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#3B0A45' }}>{yieldPerBox.toFixed(1)}L</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>Lucro Estimado</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#2E7D32' }}>{formatCurrency(liters * 15 - cost)}</div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">💾 Salvar Barcada</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Batches Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4E8F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>Barcadas Registradas</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{batches.length} registros</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                  {['Nº Barcada', 'Data', 'Fornecedor', 'Tipo', 'Caixas', 'Litros', 'Custo Total', 'R$/Litro', 'Rend./Cx', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#5B145F' }}>{b.batch_number}</td>
                    <td style={{ padding: '12px 14px', color: '#374151' }}>{formatDate(b.date)}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>{b.supplier_name}</td>
                    <td style={{ padding: '12px 14px', color: '#6B7280' }}>{b.acai_type}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>{b.boxes_quantity}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#7A2E83' }}>{b.total_liters}L</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{formatCurrency(b.total_cost)}</td>
                    <td style={{ padding: '12px 14px', color: '#374151' }}>{formatCurrency(b.cost_per_liter)}</td>
                    <td style={{ padding: '12px 14px', color: '#374151' }}>{b.yield_per_box.toFixed(1)}L</td>
                    <td style={{ padding: '12px 14px' }}><span className={`badge ${batchStatusColor[b.status]}`}>{batchStatusLabel[b.status]}</span></td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => setSelected(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>👁️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3B0A45', margin: 0 }}>🫐 {selected.batch_number}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Data', formatDate(selected.date)],
                  ['Fornecedor', selected.supplier_name],
                  ['Tipo', selected.acai_type],
                  ['Status', batchStatusLabel[selected.status]],
                  ['Caixas', `${selected.boxes_quantity} cx`],
                  ['Total Litros', `${selected.total_liters}L`],
                  ['Custo Total', formatCurrency(selected.total_cost)],
                  ['Custo/Caixa', formatCurrency(selected.cost_per_box)],
                  ['Custo/Litro', formatCurrency(selected.cost_per_liter)],
                  ['Rendimento/Cx', `${selected.yield_per_box.toFixed(1)}L`],
                  ['Responsável', selected.responsible_name],
                  ['Lucro Estimado', formatCurrency(selected.total_liters * 15 - selected.total_cost)],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#F9F4FB', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#7A2E83', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{value}</div>
                  </div>
                ))}
              </div>
              {selected.notes && <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFF8E1', borderRadius: 10, fontSize: 13, color: '#6B7280' }}>📝 {selected.notes}</div>}
              <button onClick={() => setSelected(null)} className="btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
