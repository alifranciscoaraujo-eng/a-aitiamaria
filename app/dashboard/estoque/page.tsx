'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { mockProducts, mockStockMovements } from '@/lib/mockData'
import { formatCurrency, formatDateTime, movementTypeLabel, movementTypeColor } from '@/lib/utils'
import type { Product, StockMovement, MovementType } from '@/lib/types'

export default function EstoquePage() {
  const [products] = useState<Product[]>(mockProducts)
  const [movements, setMovements] = useState<StockMovement[]>(mockStockMovements)
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustForm, setAdjustForm] = useState({ product_id: 'p1', movement_type: 'ajuste' as MovementType, quantity_units: '', reason: '', notes: '' })
  const [tab, setTab] = useState<'estoque' | 'movimentacoes'>('estoque')

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault()
    const prod = products.find(p => p.id === adjustForm.product_id)
    const m: StockMovement = {
      id: `sm${Date.now()}`,
      product_id: adjustForm.product_id,
      product_name: prod?.name ?? '',
      movement_type: adjustForm.movement_type,
      origin_type: 'ajuste_manual',
      quantity_units: Number(adjustForm.quantity_units),
      quantity_liters: Number(adjustForm.quantity_units) * (prod?.volume_liters ?? 0),
      reason: adjustForm.reason,
      responsible_name: 'Maria da Silva',
      created_at: new Date().toISOString(),
    }
    setMovements(prev => [m, ...prev])
    setShowAdjust(false)
    setAdjustForm({ product_id: 'p1', movement_type: 'ajuste', quantity_units: '', reason: '', notes: '' })
  }

  const lowStock = products.filter(p => p.current_stock <= p.minimum_stock)
  const totalLiters = products.reduce((s, p) => s + p.current_stock * p.volume_liters, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="Estoque" />
      <div style={{ padding: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { icon: '📦', label: 'Total de Produtos', value: `${products.length}` },
            { icon: '💧', label: 'Total em Estoque', value: `${totalLiters.toFixed(0)}L` },
            { icon: '⚠️', label: 'Estoque Baixo', value: `${lowStock.length} produtos`, color: '#D32F2F' },
            { icon: '💰', label: 'Valor do Estoque', value: formatCurrency(products.reduce((s, p) => s + p.current_stock * p.sale_price, 0)) },
          ].map((card, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: card.color ?? '#3B0A45' }}>{card.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Low stock alerts */}
        {lowStock.length > 0 && (
          <div style={{ background: '#FFF8E1', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#92400E', fontSize: 13 }}>⚠️ Estoque baixo:</span>
            {lowStock.map(p => (
              <span key={p.id} className="badge badge-yellow">{p.name} ({p.current_stock} un)</span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#F4E8F7', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {(['estoque', 'movimentacoes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === t ? 'white' : 'transparent', color: tab === t ? '#5B145F' : '#9CA3AF', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              {t === 'estoque' ? '📦 Estoque Atual' : '📋 Movimentações'}
            </button>
          ))}
        </div>

        {tab === 'estoque' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn-primary" onClick={() => setShowAdjust(true)}>+ Ajuste de Estoque</button>
            </div>

            {showAdjust && (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 16px' }}>Ajuste Manual de Estoque</h3>
                <form onSubmit={handleAdjust}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#374151' }}>Produto</label>
                      <select value={adjustForm.product_id} onChange={e => setAdjustForm(p => ({ ...p, product_id: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#374151' }}>Tipo</label>
                      <select value={adjustForm.movement_type} onChange={e => setAdjustForm(p => ({ ...p, movement_type: e.target.value as MovementType }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                        {(['perda', 'doacao', 'consumo_interno', 'ajuste'] as MovementType[]).map(t => <option key={t} value={t}>{movementTypeLabel[t]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#374151' }}>Quantidade (un)</label>
                      <input type="number" required value={adjustForm.quantity_units} onChange={e => setAdjustForm(p => ({ ...p, quantity_units: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#374151' }}>Justificativa (obrigatória)</label>
                    <input required value={adjustForm.reason} onChange={e => setAdjustForm(p => ({ ...p, reason: e.target.value }))} placeholder="Descreva o motivo do ajuste..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn-primary">💾 Salvar Ajuste</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowAdjust(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                    {['Produto', 'Volume', 'Estoque Atual', 'Mínimo', 'Litros em Estoque', 'Preço Venda', 'Valor Total', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const low = p.current_stock <= p.minimum_stock
                    return (
                      <tr key={p.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '12px 14px', color: '#6B7280' }}>{p.volume_liters}L</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: low ? '#D32F2F' : '#2E7D32' }}>{p.current_stock}</span>
                          <span style={{ color: '#9CA3AF', fontSize: 11 }}> un</span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#6B7280' }}>{p.minimum_stock} un</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#7A2E83' }}>{(p.current_stock * p.volume_liters).toFixed(1)}L</td>
                        <td style={{ padding: '12px 14px' }}>{formatCurrency(p.sale_price)}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{formatCurrency(p.current_stock * p.sale_price)}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${low ? 'badge-red' : 'badge-green'}`}>{low ? '⚠️ Baixo' : '✅ OK'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'movimentacoes' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                  {['Data/Hora', 'Produto', 'Tipo', 'Unidades', 'Litros', 'Motivo', 'Responsável'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                    <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 12 }}>{formatDateTime(m.created_at)}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 500 }}>{m.product_name}</td>
                    <td style={{ padding: '12px 14px' }}><span className={`badge ${movementTypeColor[m.movement_type]}`}>{movementTypeLabel[m.movement_type]}</span></td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: m.movement_type === 'entrada' ? '#2E7D32' : '#D32F2F' }}>
                      {m.movement_type === 'entrada' ? '+' : '-'}{m.quantity_units}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#7A2E83' }}>{m.quantity_liters.toFixed(1)}L</td>
                    <td style={{ padding: '12px 14px', color: '#374151', maxWidth: 200 }}>{m.reason}</td>
                    <td style={{ padding: '12px 14px', color: '#6B7280' }}>{m.responsible_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
