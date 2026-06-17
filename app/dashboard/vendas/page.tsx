'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { mockSales, mockProducts, mockCustomers } from '@/lib/mockData'
import { formatCurrency, formatDateTime, paymentMethodLabel } from '@/lib/utils'
import type { Sale, SaleItem, PaymentMethod } from '@/lib/types'

type CartItem = { product_id: string; product_name: string; volume: number; quantity: number; unit_price: number; discount: number }

const paymentMethods: PaymentMethod[] = ['dinheiro', 'pix', 'debito', 'credito', 'fiado', 'transferencia', 'cortesia', 'doacao']

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>(mockSales)
  const [tab, setTab] = useState<'nova' | 'historico'>('nova')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[1].id)
  const [qty, setQty] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [filterDate, setFilterDate] = useState('2026-06-16')

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const totalDiscount = cart.reduce((s, i) => s + i.discount, 0) + discount
  const total = subtotal - totalDiscount

  function addToCart() {
    const p = mockProducts.find(x => x.id === selectedProduct)
    if (!p) return
    setCart(prev => {
      const exists = prev.find(i => i.product_id === p.id)
      if (exists) return prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { product_id: p.id, product_name: p.name, volume: p.volume_liters, quantity: qty, unit_price: p.sale_price, discount: 0 }]
    })
    setQty(1)
  }

  function removeFromCart(pid: string) { setCart(prev => prev.filter(i => i.product_id !== pid)) }

  function finalizeSale() {
    if (cart.length === 0) return
    const customer = mockCustomers.find(c => c.id === customerId)
    const newSale: Sale = {
      id: `v${Date.now()}`,
      sale_date: new Date().toISOString(),
      customer_id: customerId || undefined,
      customer_name: customer?.name,
      seller_name: 'Ana Lima',
      items: cart.map((i, idx) => ({
        id: `item${idx}`,
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        discount: i.discount,
        total: i.quantity * i.unit_price - i.discount,
        liters_total: i.quantity * i.volume,
      })),
      gross_total: subtotal,
      discount_total: totalDiscount,
      net_total: total,
      payment_method: payment,
      status: 'ativa',
      notes,
      created_at: new Date().toISOString(),
    }
    setSales(prev => [newSale, ...prev])
    setCart([])
    setDiscount(0)
    setNotes('')
    setCustomerId('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const filteredSales = sales.filter(s => s.sale_date.startsWith(filterDate))
  const dayRevenue = filteredSales.filter(s => s.status === 'ativa').reduce((sum, s) => sum + s.net_total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="Vendas" />
      <div style={{ padding: 24 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F4E8F7', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {(['nova', 'historico'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === t ? 'white' : 'transparent', color: tab === t ? '#5B145F' : '#9CA3AF', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              {t === 'nova' ? '🛒 Nova Venda' : '📋 Histórico de Vendas'}
            </button>
          ))}
        </div>

        {success && (
          <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 12, padding: '12px 20px', marginBottom: 16, fontWeight: 600, color: '#2E7D32' }}>
            ✅ Venda registrada com sucesso!
          </div>
        )}

        {tab === 'nova' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
            {/* Products */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Adicionar Produto</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Produto</label>
                    <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                      {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.sale_price)}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Quantidade</label>
                    <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                  <button onClick={addToCart} className="btn-primary" style={{ height: 40 }}>+ Adicionar</button>
                </div>
              </div>

              {/* Cart */}
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>🛒 Carrinho</div>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: 14 }}>Nenhum produto adicionado</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #F4E8F7' }}>
                        {['Produto', 'Qtd', 'Preço Unit.', 'Total', ''].map(h => (
                          <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.product_id} style={{ borderBottom: '1px solid #F9F4FB' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 500 }}>{item.product_name}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                          <td style={{ padding: '10px 8px' }}>{formatCurrency(item.unit_price)}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 700, color: '#2E7D32' }}>{formatCurrency(item.quantity * item.unit_price)}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D32F2F', fontSize: 16 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>Resumo da Venda</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Cliente (opcional)</label>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    <option value="">Avulso</option>
                    {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Forma de Pagamento</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {paymentMethods.map(pm => (
                      <button key={pm} onClick={() => setPayment(pm)} style={{ padding: '8px', borderRadius: 8, border: `1.5px solid ${payment === pm ? '#7A2E83' : '#E5E7EB'}`, background: payment === pm ? '#F4E8F7' : 'white', color: payment === pm ? '#5B145F' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                        {paymentMethodLabel[pm]}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Desconto geral (R$)</label>
                  <input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Observações</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, resize: 'none' }} />
                </div>

                {/* Total breakdown */}
                <div style={{ background: '#F9F4FB', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                  {[
                    ['Subtotal', formatCurrency(subtotal)],
                    ['Descontos', `- ${formatCurrency(totalDiscount)}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                      <span>{label}</span><span>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: '#3B0A45', borderTop: '2px solid #F0EAF5', paddingTop: 10, marginTop: 4 }}>
                    <span>TOTAL</span><span style={{ color: '#2E7D32' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                <button onClick={finalizeSale} disabled={cart.length === 0} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: cart.length === 0 ? 0.5 : 1 }}>
                  ✅ Finalizar Venda
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'historico' && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
              <div style={{ background: '#F4E8F7', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#5B145F' }}>
                {filteredSales.filter(s => s.status === 'ativa').length} vendas · {formatCurrency(dayRevenue)}
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                    {['Data/Hora', 'Cliente', 'Itens', 'Bruto', 'Desconto', 'Total', 'Pagamento', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                      <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 12 }}>{formatDateTime(s.sale_date)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 500 }}>{s.customer_name ?? 'Avulso'}</td>
                      <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 11 }}>{s.items.map(i => `${i.quantity}x ${i.product_name.split(' ').slice(0,2).join(' ')}`).join(', ')}</td>
                      <td style={{ padding: '12px 14px' }}>{formatCurrency(s.gross_total)}</td>
                      <td style={{ padding: '12px 14px', color: s.discount_total > 0 ? '#D32F2F' : '#9CA3AF' }}>{s.discount_total > 0 ? `- ${formatCurrency(s.discount_total)}` : '—'}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2E7D32' }}>{formatCurrency(s.net_total)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${s.payment_method === 'pix' ? 'badge-purple' : s.payment_method === 'dinheiro' ? 'badge-green' : s.payment_method === 'fiado' ? 'badge-yellow' : s.payment_method === 'cortesia' || s.payment_method === 'doacao' ? 'badge-gray' : 'badge-blue'}`}>
                          {paymentMethodLabel[s.payment_method]}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${s.status === 'ativa' ? 'badge-green' : 'badge-red'}`}>{s.status === 'ativa' ? 'Ativa' : 'Cancelada'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
