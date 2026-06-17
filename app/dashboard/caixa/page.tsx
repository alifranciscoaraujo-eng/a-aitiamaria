'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { mockCashSession } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import type { CashSession } from '@/lib/types'

export default function CaixaPage() {
  const [session, setSession] = useState<CashSession>(mockCashSession)
  const [informed, setInformed] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [closed, setClosed] = useState(false)

  const informedNum = Number(informed) || 0
  const diff = informedNum - session.expected_amount

  function handleClose(e: React.FormEvent) {
    e.preventDefault()
    if (Math.abs(diff) > 5 && !closingNotes) {
      alert('Há divergência. Justificativa obrigatória.')
      return
    }
    setSession(prev => ({
      ...prev,
      closing_date: new Date().toISOString(),
      informed_amount: informedNum,
      difference_amount: diff,
      status: Math.abs(diff) <= 1 ? 'conferido' : 'divergencia',
      notes: closingNotes,
    }))
    setClosed(true)
  }

  const isOpen = session.status === 'aberto'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="Caixa" />
      <div style={{ padding: 24 }}>

        {/* Status banner */}
        <div style={{ background: isOpen ? 'linear-gradient(135deg, #2E7D32, #388E3C)' : closed ? 'linear-gradient(135deg, #5B145F, #7A2E83)' : 'linear-gradient(135deg, #D32F2F, #C62828)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>
              {isOpen ? '🟢 Caixa Aberto' : closed ? '✅ Caixa Fechado' : '⚠️ Caixa com Divergência'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
              Operador: {session.operator_name} · Abertura: R$ {session.opening_amount.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Total esperado</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 24 }}>{formatCurrency(session.expected_amount)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* Breakdown */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>💵 Detalhamento por Forma de Pagamento</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Dinheiro', value: session.total_cash, icon: '💵', color: '#2E7D32' },
                  { label: 'PIX', value: session.total_pix, icon: '📱', color: '#7A2E83' },
                  { label: 'Débito', value: session.total_debit, icon: '💳', color: '#1565C0' },
                  { label: 'Crédito', value: session.total_credit, icon: '💳', color: '#6A1B9A' },
                  { label: 'Fiado', value: session.total_fiado, icon: '📋', color: '#F57F17' },
                  { label: 'Transferência', value: 350, icon: '🏦', color: '#0277BD' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#F9F4FB', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{formatCurrency(item.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>📊 Resumo do Dia</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Venda Bruta', value: formatCurrency(789 + 15), color: '#3B0A45', bold: false },
                  { label: 'Descontos', value: `- ${formatCurrency(session.total_discounts)}`, color: '#D32F2F', bold: false },
                  { label: 'Venda Líquida', value: formatCurrency(789), color: '#2E7D32', bold: true },
                  { label: 'Despesas do Caixa', value: `- ${formatCurrency(session.total_expenses)}`, color: '#D32F2F', bold: false },
                  { label: 'Sangrias', value: `- ${formatCurrency(session.total_sangria)}`, color: '#D32F2F', bold: false },
                  { label: 'Valor Inicial', value: formatCurrency(session.opening_amount), color: '#6B7280', bold: false },
                  { label: 'Saldo Esperado em Caixa', value: formatCurrency(session.expected_amount), color: '#5B145F', bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F4E8F7' }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: row.bold ? 800 : 500, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Closing form */}
          <div>
            {!closed ? (
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>🔒 Fechar Caixa</div>
                <form onSubmit={handleClose}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Valor contado em caixa (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={informed}
                      onChange={e => setInformed(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', border: '2px solid #E5E7EB', borderRadius: 12, fontSize: 18, fontWeight: 700, textAlign: 'right' }}
                    />
                  </div>

                  {informed !== '' && (
                    <div style={{ background: Math.abs(diff) <= 1 ? '#E8F5E9' : '#FFF8E1', border: `1.5px solid ${Math.abs(diff) <= 1 ? '#A5D6A7' : '#FDE68A'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Resultado do fechamento</div>
                      {[
                        ['Esperado', formatCurrency(session.expected_amount)],
                        ['Informado', formatCurrency(informedNum)],
                        ['Diferença', `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ color: '#6B7280' }}>{l}</span>
                          <span style={{ fontWeight: 700, color: l === 'Diferença' ? (diff >= 0 ? '#2E7D32' : '#D32F2F') : '#374151' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                      Observações {Math.abs(diff) > 5 ? '(obrigatório — divergência detectada)' : '(opcional)'}
                    </label>
                    <textarea
                      value={closingNotes}
                      onChange={e => setClosingNotes(e.target.value)}
                      rows={3}
                      placeholder="Justifique divergências ou adicione observações..."
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, resize: 'none' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}>
                    🔒 Fechar Caixa
                  </button>
                </form>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{Math.abs(session.difference_amount) <= 1 ? '✅' : '⚠️'}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#3B0A45', marginBottom: 8 }}>Caixa Fechado!</div>
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                  Status: <strong>{Math.abs(session.difference_amount) <= 1 ? 'Conferido sem divergência' : `Divergência de ${formatCurrency(session.difference_amount)}`}</strong>
                </div>
                <div style={{ background: '#F4E8F7', borderRadius: 12, padding: 16, textAlign: 'left' }}>
                  {[
                    ['Venda Líquida', formatCurrency(789)],
                    ['Total Recebido', formatCurrency(informedNum)],
                    ['Diferença', formatCurrency(session.difference_amount)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                      <span style={{ color: '#6B7280' }}>{l}</span>
                      <span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
