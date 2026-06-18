'use client'
import { useState, useEffect } from 'react'
import { getProdutos, setProdutos, getHistorico, setHistorico, Produto, HistoricoPreco } from '@/lib/producaoData'
import { formatCurrency } from '@/lib/utils'

function today() { return new Date().toISOString().slice(0, 10) }
function nowISO() { return new Date().toISOString() }
function fmtDate(iso: string) { const [y,m,d] = iso.slice(0,10).split('-'); return `${d}/${m}/${y}` }
function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function ProdutosPage() {
  const [produtos, setProdutosState] = useState<Produto[]>([])
  const [historico, setHistoricoState] = useState<HistoricoPreco[]>([])
  const [loaded, setLoaded] = useState(false)

  // modals
  const [editProd, setEditProd] = useState<Produto | null>(null)
  const [editPreco, setEditPreco] = useState<Produto | null>(null)
  const [viewHist, setViewHist] = useState<Produto | null>(null)
  const [showNewProd, setShowNewProd] = useState(false)

  // forms
  const [prodForm, setProdForm] = useState({ nome: '', descricao: '', valor_litro: '', data_vigencia: today() })
  const [precoForm, setPrecoForm] = useState({ novo_valor: '', motivo: '', data_vigencia: today() })
  const [precoConfirm, setPrecoConfirm] = useState(false)

  useEffect(() => {
    setProdutosState(getProdutos())
    setHistoricoState(getHistorico())
    setLoaded(true)
  }, [])

  function saveProdutosLocal(p: Produto[]) { setProdutosState(p); setProdutos(p) }
  function saveHistoricoLocal(h: HistoricoPreco[]) { setHistoricoState(h); setHistorico(h) }

  // KPIs
  const ativos = produtos.filter(p => p.status === 'ativo')
  const inativos = produtos.filter(p => p.status === 'inativo')
  const precoMedio = ativos.length ? ativos.reduce((s,p) => s + p.valor_litro, 0) / ativos.length : 0
  const ultimaAlteracao = historico.length ? historico.slice().sort((a,b) => b.data_alteracao.localeCompare(a.data_alteracao))[0] : null

  function openEditProd(p: Produto) {
    setEditProd(p)
    setProdForm({ nome: p.nome, descricao: p.descricao, valor_litro: String(p.valor_litro), data_vigencia: p.data_vigencia })
  }

  function openEditPreco(p: Produto) {
    setEditPreco(p)
    setPrecoForm({ novo_valor: '', motivo: '', data_vigencia: today() })
    setPrecoConfirm(false)
  }

  function handleSaveProd(e: React.FormEvent) {
    e.preventDefault()
    const updated = produtos.map(p => p.id === editProd!.id ? {
      ...p, nome: prodForm.nome, descricao: prodForm.descricao,
      data_vigencia: prodForm.data_vigencia, data_alteracao: nowISO(), usuario: 'admin',
    } : p)
    saveProdutosLocal(updated)
    setEditProd(null)
  }

  function handleNewProd(e: React.FormEvent) {
    e.preventDefault()
    const novo: Produto = {
      id: `prod${Date.now()}`, nome: prodForm.nome, descricao: prodForm.descricao,
      valor_litro: Number(prodForm.valor_litro), status: 'ativo',
      data_vigencia: prodForm.data_vigencia, data_alteracao: nowISO(), usuario: 'admin',
    }
    saveProdutosLocal([...produtos, novo])
    setShowNewProd(false)
    setProdForm({ nome: '', descricao: '', valor_litro: '', data_vigencia: today() })
  }

  function handleSavePreco() {
    const novo = Number(precoForm.novo_valor)
    if (!novo || novo <= 0) return alert('Informe um valor válido.')
    const prod = editPreco!
    const hist: HistoricoPreco = {
      id: `h${Date.now()}`, produto_id: prod.id, produto_nome: prod.nome,
      valor_anterior: prod.valor_litro, novo_valor: novo,
      data_alteracao: nowISO(), usuario: 'admin',
      motivo: precoForm.motivo, data_vigencia: precoForm.data_vigencia,
    }
    const updated = produtos.map(p => p.id === prod.id ? {
      ...p, valor_litro: novo, data_vigencia: precoForm.data_vigencia, data_alteracao: nowISO(), usuario: 'admin',
    } : p)
    saveProdutosLocal(updated)
    saveHistoricoLocal([hist, ...historico])
    setEditPreco(null)
    setPrecoConfirm(false)
  }

  function toggleStatus(p: Produto) {
    const updated = produtos.map(x => x.id === p.id ? { ...x, status: x.status === 'ativo' ? 'inativo' as const : 'ativo' as const, data_alteracao: nowISO() } : x)
    saveProdutosLocal(updated)
  }

  if (!loaded) return null

  const histProd = viewHist ? historico.filter(h => h.produto_id === viewHist.id).sort((a,b) => b.data_alteracao.localeCompare(a.data_alteracao)) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24, background: '#F8F5FB', minHeight: '100%' }}>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Produtos', value: String(produtos.length), accent: '#7A2E83', icon: '🫐' },
            { label: 'Ativos', value: String(ativos.length), accent: '#059669', icon: '✅' },
            { label: 'Inativos', value: String(inativos.length), accent: '#DC2626', icon: '⏸️' },
            { label: 'Preço Médio/L', value: formatCurrency(precoMedio), accent: '#1D4ED8', icon: '💰' },
            { label: 'Última Alteração', value: ultimaAlteracao ? fmtDate(ultimaAlteracao.data_vigencia) : '—', accent: '#D97706', icon: '📅' },
          ].map(c => (
            <div key={c.label} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.06)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.accent }} />
              <div style={{ width: 34, height: 34, borderRadius: 9, background: c.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 8, marginTop: 2 }}>{c.icon}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1F1235', lineHeight: 1 }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#3B0A45' }}>🫐 Produtos Cadastrados</div>
          <button onClick={() => { setShowNewProd(true); setProdForm({ nome: '', descricao: '', valor_litro: '', data_vigencia: today() }) }}
            style={{ background: '#7A2E83', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            + Novo Produto
          </button>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE8F5', overflow: 'hidden', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9F4FB', borderBottom: '1px solid #EDE8F5' }}>
                  {['Produto', 'Descrição', 'Valor/Litro', 'Vigência', 'Status', 'Última Alteração', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produtos.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < produtos.length - 1 ? '1px solid #F3F0F8' : 'none', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1F1235' }}>{p.nome}</td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{p.descricao || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#059669' }}>{formatCurrency(p.valor_litro)}</td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{fmtDate(p.data_vigencia)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: p.status === 'ativo' ? '#D1FAE5' : '#FEE2E2', color: p.status === 'ativo' ? '#059669' : '#DC2626', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                        {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9CA3AF', fontSize: 12 }}>{fmtDateTime(p.data_alteracao)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => openEditPreco(p)} style={{ background: '#EDE8F5', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#5B145F', cursor: 'pointer', whiteSpace: 'nowrap' }}>💲 Preço</button>
                        <button onClick={() => openEditProd(p)} style={{ background: '#F0F9FF', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#1D4ED8', cursor: 'pointer' }}>✏️ Editar</button>
                        <button onClick={() => setViewHist(p)} style={{ background: '#F9F4FB', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#7A2E83', cursor: 'pointer' }}>📋 Histórico</button>
                        <button onClick={() => toggleStatus(p)} style={{ background: p.status === 'ativo' ? '#FEE2E2' : '#D1FAE5', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: p.status === 'ativo' ? '#DC2626' : '#059669', cursor: 'pointer' }}>
                          {p.status === 'ativo' ? 'Inativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {produtos.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Nenhum produto cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Novo produto */}
      {showNewProd && (
        <Modal title="🫐 Novo Produto" onClose={() => setShowNewProd(false)}>
          <form onSubmit={handleNewProd}>
            <Field label="Nome do produto *">
              <input required value={prodForm.nome} onChange={e => setProdForm(p => ({ ...p, nome: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Descrição">
              <input value={prodForm.descricao} onChange={e => setProdForm(p => ({ ...p, descricao: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Valor por litro (R$) *">
              <input required type="number" min="0.01" step="0.01" value={prodForm.valor_litro} onChange={e => setProdForm(p => ({ ...p, valor_litro: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Data de início da vigência *">
              <input required type="date" value={prodForm.data_vigencia} onChange={e => setProdForm(p => ({ ...p, data_vigencia: e.target.value }))} style={inputStyle} />
            </Field>
            <ModalActions>
              <button type="submit" style={btnPrimary}>💾 Salvar</button>
              <button type="button" style={btnSecondary} onClick={() => setShowNewProd(false)}>Cancelar</button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {/* Modal: Editar produto */}
      {editProd && (
        <Modal title={`✏️ Editar — ${editProd.nome}`} onClose={() => setEditProd(null)}>
          <form onSubmit={handleSaveProd}>
            <Field label="Nome do produto *">
              <input required value={prodForm.nome} onChange={e => setProdForm(p => ({ ...p, nome: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Descrição">
              <input value={prodForm.descricao} onChange={e => setProdForm(p => ({ ...p, descricao: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Data de início da vigência">
              <input type="date" value={prodForm.data_vigencia} onChange={e => setProdForm(p => ({ ...p, data_vigencia: e.target.value }))} style={inputStyle} />
            </Field>
            <ModalActions>
              <button type="submit" style={btnPrimary}>💾 Salvar</button>
              <button type="button" style={btnSecondary} onClick={() => setEditProd(null)}>Cancelar</button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {/* Modal: Editar preço */}
      {editPreco && (
        <Modal title={`💲 Alterar Preço — ${editPreco.nome}`} onClose={() => { setEditPreco(null); setPrecoConfirm(false) }}>
          {!precoConfirm ? (
            <div>
              <div style={{ background: '#F9F4FB', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Valor atual por litro</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{formatCurrency(editPreco.valor_litro)}</div>
              </div>
              <Field label="Novo valor por litro (R$) *">
                <input required type="number" min="0.01" step="0.01" value={precoForm.novo_valor}
                  onChange={e => setPrecoForm(p => ({ ...p, novo_valor: e.target.value }))} style={inputStyle} placeholder="0,00" />
              </Field>
              <Field label="Motivo da alteração">
                <input value={precoForm.motivo} onChange={e => setPrecoForm(p => ({ ...p, motivo: e.target.value }))} style={inputStyle} placeholder="Opcional" />
              </Field>
              <Field label="Data de início da vigência *">
                <input required type="date" value={precoForm.data_vigencia} onChange={e => setPrecoForm(p => ({ ...p, data_vigencia: e.target.value }))} style={inputStyle} />
              </Field>
              <ModalActions>
                <button style={btnPrimary} onClick={() => { if (!precoForm.novo_valor || Number(precoForm.novo_valor) <= 0) { alert('Informe um valor válido.'); return } if (!precoForm.data_vigencia) { alert('Informe a data de vigência.'); return } setPrecoConfirm(true) }}>Continuar</button>
                <button style={btnSecondary} onClick={() => setEditPreco(null)}>Cancelar</button>
              </ModalActions>
            </div>
          ) : (
            <div>
              <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
                ⚠️ <strong>Atenção:</strong> o novo valor será aplicado apenas aos novos lançamentos realizados após esta alteração. Barcadas anteriores manterão o valor antigo para preservar o histórico. Deseja continuar?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Produto', editPreco.nome],
                  ['Valor atual', formatCurrency(editPreco.valor_litro)],
                  ['Novo valor', formatCurrency(Number(precoForm.novo_valor))],
                  ['Vigência a partir de', fmtDate(precoForm.data_vigencia)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#F9F4FB', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontWeight: 700, color: '#1F1235', fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
              <ModalActions>
                <button style={btnPrimary} onClick={handleSavePreco}>✅ Confirmar Alteração</button>
                <button style={btnSecondary} onClick={() => setPrecoConfirm(false)}>Voltar</button>
              </ModalActions>
            </div>
          )}
        </Modal>
      )}

      {/* Modal: Histórico de preços */}
      {viewHist && (
        <Modal title={`📋 Histórico de Preços — ${viewHist.nome}`} onClose={() => setViewHist(null)} wide>
          {histProd.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 24 }}>Nenhuma alteração registrada ainda.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9F4FB' }}>
                  {['Data/Hora', 'Valor Anterior', 'Novo Valor', 'Vigência', 'Usuário', 'Motivo'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {histProd.map((h, i) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #F3F0F8', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{fmtDateTime(h.data_alteracao)}</td>
                    <td style={{ padding: '10px 14px', color: '#DC2626', fontWeight: 700 }}>{formatCurrency(h.valor_anterior)}</td>
                    <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 700 }}>{formatCurrency(h.novo_valor)}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{fmtDate(h.data_vigencia)}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{h.usuario}</td>
                    <td style={{ padding: '10px 14px', color: '#9CA3AF' }}>{h.motivo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <ModalActions>
            <button style={btnSecondary} onClick={() => setViewHist(null)}>Fechar</button>
          </ModalActions>
        </Modal>
      )}
    </div>
  )
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 18, padding: 28, width: '100%', maxWidth: wide ? 700 : 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(59,10,69,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#3B0A45' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

function ModalActions({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>{children}</div>
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, boxSizing: 'border-box', outline: 'none' }
const btnPrimary: React.CSSProperties = { background: '#7A2E83', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
