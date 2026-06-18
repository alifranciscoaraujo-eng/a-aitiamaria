'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  getProdutos, getEmbalagens, getBarcadas, setBarcadas,
  Produto, Embalagem, Barcada, BarcadaLinha,
} from '@/lib/producaoData'
import { loadEntries } from '@/lib/dailyData'
import { formatCurrency } from '@/lib/utils'

function parseBR(d: string) {
  const [day, m, y] = d.split('/')
  return new Date(Number(y), Number(m) - 1, Number(day))
}

function today() { return new Date().toLocaleDateString('pt-BR') }
function nowISO() { return new Date().toISOString() }

const FORNECEDOR = 'Fazenda Ouro Verde'

interface LinhaForm { embalagem_id: string; num_pacotes: string }

const emptyForm = () => ({ data: today(), numero: '', produto_id: '', num_caixas: '', responsavel: '', observacoes: '' })

export default function ProducaoPage() {
  const [produtos, setProdutosState] = useState<Produto[]>([])
  const [embalagens, setEmbalagensState] = useState<Embalagem[]>([])
  const [barcadas, setBarcadasState] = useState<Barcada[]>([])
  const [historicas, setHistoricas] = useState<Barcada[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [viewBarcada, setViewBarcada] = useState<Barcada | null>(null)
  const [printBarcada, setPrintBarcada] = useState<Barcada | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [linhas, setLinhas] = useState<LinhaForm[]>([{ embalagem_id: '', num_pacotes: '' }])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    setProdutosState(getProdutos())
    setEmbalagensState(getEmbalagens())
    setBarcadasState(getBarcadas())
    setLoaded(true)
    // Barcadas anteriores derivadas da planilha base (1 por dia de produção)
    loadEntries().then(entries => {
      const hist: Barcada[] = entries
        .filter(e => e.cxs > 0)
        .map(e => ({
          id: `hist-${e.data}`,
          numero: e.data,
          data: e.data,
          fornecedor: FORNECEDOR,
          produto_id: '',
          produto_nome: '—',
          valor_litro_historico: e.custo_litro,
          num_caixas: e.cxs,
          linhas: [],
          total_pacotes: 0,
          total_litros: e.litros,
          valor_total: e.valor_total,
          responsavel: '',
          observacoes: 'Importado da planilha base',
          created_at: '',
        }))
      setHistoricas(hist)
    })
  }, [])

  // Barcadas manuais (localStorage) + históricas da planilha, ordenadas por data desc
  const todasBarcadas = useMemo(() => {
    return [...barcadas, ...historicas].sort((a, b) => parseBR(b.data).getTime() - parseBR(a.data).getTime())
  }, [barcadas, historicas])

  const produtosAtivos = produtos.filter(p => p.status === 'ativo')
  const produtoSelecionado = produtosAtivos.find(p => p.id === form.produto_id) ?? null

  const linhasCalc = useMemo<BarcadaLinha[]>(() => {
    if (!produtoSelecionado) return []
    return linhas.map(l => {
      const emb = embalagens.find(e => e.id === l.embalagem_id)
      const nPac = Number(l.num_pacotes) || 0
      const litros = emb ? nPac * emb.volume : 0
      const total = litros * produtoSelecionado.valor_litro
      return { embalagem_id: l.embalagem_id, embalagem_nome: emb?.nome ?? '', volume_litros: emb?.volume ?? 0, num_pacotes: nPac, litros_calculados: litros, valor_litro: produtoSelecionado.valor_litro, total }
    }).filter(l => l.embalagem_id)
  }, [linhas, produtoSelecionado, embalagens])

  const totalPacotes = linhasCalc.reduce((s, l) => s + l.num_pacotes, 0)
  const totalLitros = linhasCalc.reduce((s, l) => s + l.litros_calculados, 0)
  const valorTotal = linhasCalc.reduce((s, l) => s + l.total, 0)

  const totalCxs = todasBarcadas.reduce((s, b) => s + b.num_caixas, 0)
  const totalLitrosProd = todasBarcadas.reduce((s, b) => s + b.total_litros, 0)
  const valorTotalProd = todasBarcadas.reduce((s, b) => s + b.valor_total, 0)

  function validate() {
    const errs: string[] = []
    if (!form.data) errs.push('Informe a data.')
    if (!form.numero.trim()) errs.push('Informe o número da barcada.')
    if (!form.produto_id) errs.push('Selecione o tipo de açaí.')
    if (!produtoSelecionado?.valor_litro) errs.push('Produto sem valor por litro vigente.')
    if (!form.num_caixas || Number(form.num_caixas) <= 0) errs.push('Informe o número de caixas.')
    const valid = linhas.filter(l => l.embalagem_id)
    if (!valid.length) errs.push('Adicione ao menos uma linha na composição.')
    valid.forEach((l, i) => { if (!l.num_pacotes || Number(l.num_pacotes) <= 0) errs.push(`Linha ${i + 1}: informe a quantidade de pacotes.`) })
    return errs
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (errs.length) { setErrors(errs); return }
    const nova: Barcada = {
      id: `barc${Date.now()}`, numero: form.numero.trim(), data: form.data, fornecedor: FORNECEDOR,
      produto_id: produtoSelecionado!.id, produto_nome: produtoSelecionado!.nome,
      valor_litro_historico: produtoSelecionado!.valor_litro, num_caixas: Number(form.num_caixas),
      linhas: linhasCalc, total_pacotes: totalPacotes, total_litros: totalLitros, valor_total: valorTotal,
      responsavel: form.responsavel, observacoes: form.observacoes, created_at: nowISO(),
    }
    const updated = [nova, ...barcadas]
    setBarcadasState(updated); setBarcadas(updated)
    setShowForm(false); setForm(emptyForm()); setLinhas([{ embalagem_id: '', num_pacotes: '' }]); setErrors([])
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta barcada?')) return
    const updated = barcadas.filter(b => b.id !== id)
    setBarcadasState(updated); setBarcadas(updated)
  }

  function openForm() { setForm(emptyForm()); setLinhas([{ embalagem_id: '', num_pacotes: '' }]); setErrors([]); setShowForm(true) }

  if (!loaded) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24, background: '#F8F5FB', minHeight: '100%' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Barcadas', value: String(todasBarcadas.length), accent: '#7A2E83', icon: '🫐' },
            { label: 'Total Caixas', value: String(totalCxs), accent: '#0891B2', icon: '📦' },
            { label: 'Total Litros', value: `${totalLitrosProd.toFixed(1)} L`, accent: '#059669', icon: '💧' },
            { label: 'Valor Total', value: formatCurrency(valorTotalProd), accent: '#1D4ED8', icon: '💰' },
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
          <div style={{ fontWeight: 700, fontSize: 15, color: '#3B0A45' }}>📋 Barcadas Registradas</div>
          <button onClick={openForm} style={{ background: '#7A2E83', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Nova Barcada</button>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE8F5', overflow: 'hidden', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9F4FB', borderBottom: '1px solid #EDE8F5' }}>
                  {['Nº Barcada', 'Data', 'Tipo Açaí', 'Valor/L', 'Caixas', 'Pacotes', 'Litros', 'Total R$', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todasBarcadas.map((b, i) => {
                  const isHist = b.id.startsWith('hist-')
                  return (
                  <tr key={b.id} style={{ borderBottom: i < todasBarcadas.length - 1 ? '1px solid #F3F0F8' : 'none', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#5B145F' }}>
                      {b.numero}
                      {isHist && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#7A2E83', background: '#F3E8FF', borderRadius: 5, padding: '1px 5px', verticalAlign: 'middle' }}>PLANILHA</span>}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#6B7280' }}>{b.data}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{b.produto_nome}</td>
                    <td style={{ padding: '11px 14px', color: '#059669', fontWeight: 700 }}>{formatCurrency(b.valor_litro_historico)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right' }}>{b.num_caixas}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right' }}>{isHist ? '—' : b.total_pacotes}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600 }}>{b.total_litros.toFixed(1)} L</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 800, color: '#1D4ED8' }}>{formatCurrency(b.valor_total)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setViewBarcada(b)} style={btnSm('#F9F4FB', '#7A2E83')}>👁️</button>
                        {!isHist && <button onClick={() => setPrintBarcada(b)} style={btnSm('#EFF6FF', '#1D4ED8')}>🖨️</button>}
                        {!isHist && <button onClick={() => handleDelete(b.id)} style={btnSm('#FEE2E2', '#DC2626')}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                  )
                })}
                {todasBarcadas.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Nenhuma barcada registrada. Clique em + Nova Barcada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal: Nova Barcada ─────────────────────────────────────────── */}
      {showForm && (
        <Overlay>
          <div style={{ background: 'white', borderRadius: 18, padding: 28, width: '100%', maxWidth: 640, margin: 'auto', boxShadow: '0 8px 40px rgba(59,10,69,0.18)' }}>
            <ModalHeader title="🫐 Nova Barcada" onClose={() => setShowForm(false)} />
            <form onSubmit={handleSave}>
              <Section color="#F9F4FB" label="📋 Dados da Barcada">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FF label="Data *"><input value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} style={iS} placeholder="DD/MM/AAAA" /></FF>
                  <FF label="Nº da Barcada *"><input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))} style={iS} placeholder="Ex: 1ª" /></FF>
                  <FF label="Fornecedor"><input value={FORNECEDOR} readOnly style={{ ...iS, background: '#F3F4F6', color: '#6B7280' }} /></FF>
                  <FF label="Nº de Caixas *"><input type="number" min="1" value={form.num_caixas} onChange={e => setForm(p => ({ ...p, num_caixas: e.target.value }))} style={iS} placeholder="0" /></FF>
                  <FF label="Tipo de Açaí *">
                    <select value={form.produto_id} onChange={e => setForm(p => ({ ...p, produto_id: e.target.value }))} style={iS}>
                      <option value="">Selecione...</option>
                      {produtosAtivos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </FF>
                  <FF label="Valor vigente/litro">
                    <input value={produtoSelecionado ? formatCurrency(produtoSelecionado.valor_litro) : '—'} readOnly style={{ ...iS, background: '#F3F4F6', color: produtoSelecionado ? '#059669' : '#9CA3AF', fontWeight: 700 }} />
                  </FF>
                  <FF label="Responsável"><input value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))} style={iS} placeholder="Nome" /></FF>
                  <FF label="Observações"><input value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} style={iS} placeholder="Opcional" /></FF>
                </div>
              </Section>

              <Section color="#F0FDF4" label="📦 Composição da Barcada" action={
                <button type="button" onClick={() => setLinhas(p => [...p, { embalagem_id: '', num_pacotes: '' }])}
                  style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Linha</button>
              }>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#DCFCE7' }}>
                        {['Embalagem', 'Nº Pacotes', 'Litros', 'Valor/L', 'Total R$', ''].map(h => (
                          <th key={h} style={{ padding: '8px 8px', textAlign: 'left', fontWeight: 700, color: '#15803D', fontSize: 11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((l, i) => {
                        const calc = linhasCalc[i]
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #D1FAE5' }}>
                            <td style={{ padding: '5px 4px 5px 0' }}>
                              <select value={l.embalagem_id} onChange={e => setLinhas(prev => prev.map((x, j) => j === i ? { ...x, embalagem_id: e.target.value } : x))} style={{ ...iS, minWidth: 110 }}>
                                <option value="">Selecione...</option>
                                {embalagens.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '5px 4px' }}>
                              <input type="number" min="0" value={l.num_pacotes} onChange={e => setLinhas(prev => prev.map((x, j) => j === i ? { ...x, num_pacotes: e.target.value } : x))} style={{ ...iS, width: 70 }} placeholder="0" />
                            </td>
                            <td style={{ padding: '5px 8px', fontWeight: 600, color: '#15803D', whiteSpace: 'nowrap' }}>{calc ? `${calc.litros_calculados.toFixed(1)} L` : '—'}</td>
                            <td style={{ padding: '5px 8px', color: '#6B7280', whiteSpace: 'nowrap' }}>{produtoSelecionado ? formatCurrency(produtoSelecionado.valor_litro) : '—'}</td>
                            <td style={{ padding: '5px 8px', fontWeight: 700, color: '#1D4ED8', whiteSpace: 'nowrap' }}>{calc ? formatCurrency(calc.total) : '—'}</td>
                            <td style={{ padding: '5px 4px' }}>
                              {linhas.length > 1 && <button type="button" onClick={() => setLinhas(prev => prev.filter((_, j) => j !== i))} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#DC2626', fontSize: 11, cursor: 'pointer' }}>✕</button>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {linhasCalc.some(l => l.num_pacotes > 0) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12, background: '#DCFCE7', borderRadius: 10, padding: '12px 16px' }}>
                    {[['Total Pacotes', String(totalPacotes)], ['Total Litros', `${totalLitros.toFixed(1)} L`], ['Valor Total', formatCurrency(valorTotal)]].map(([l, v]) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#15803D', fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#1F1235' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {errors.length > 0 && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  {errors.map((err, i) => <div key={i} style={{ fontSize: 12, color: '#DC2626' }}>• {err}</div>)}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={btnP}>💾 Salvar Barcada</button>
                <button type="button" onClick={() => setShowForm(false)} style={btnS}>Cancelar</button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* ── Modal: Visualizar ───────────────────────────────────────────── */}
      {viewBarcada && (
        <Overlay>
          <div style={{ background: 'white', borderRadius: 18, padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(59,10,69,0.18)' }}>
            <ModalHeader title={`🫐 Barcada ${viewBarcada.numero}`} onClose={() => setViewBarcada(null)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[['Data', viewBarcada.data], ['Fornecedor', viewBarcada.fornecedor], ['Tipo de Açaí', viewBarcada.produto_nome], ['Valor/L (histórico)', formatCurrency(viewBarcada.valor_litro_historico)], ['Nº de Caixas', String(viewBarcada.num_caixas)], ['Responsável', viewBarcada.responsavel || '—']].map(([l, v]) => (
                <div key={l} style={{ background: '#F9F4FB', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontWeight: 700, color: '#1F1235', fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#3B0A45', marginBottom: 8 }}>Composição</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 14 }}>
              <thead><tr style={{ background: '#F9F4FB' }}>{['Embalagem', 'Pacotes', 'Litros', 'Valor/L', 'Total'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#6B7280', fontSize: 11 }}>{h}</th>)}</tr></thead>
              <tbody>
                {viewBarcada.linhas.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F0F8' }}>
                    <td style={{ padding: '8px 12px' }}>{l.embalagem_nome}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{l.num_pacotes}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>{l.litros_calculados.toFixed(1)} L</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#6B7280' }}>{formatCurrency(l.valor_litro)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#1D4ED8' }}>{formatCurrency(l.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{ background: '#F9F4FB', fontWeight: 800 }}>
                <td style={{ padding: '10px 12px', color: '#3B0A45' }}>TOTAL</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{viewBarcada.total_pacotes}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#059669' }}>{viewBarcada.total_litros.toFixed(1)} L</td>
                <td></td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1D4ED8' }}>{formatCurrency(viewBarcada.valor_total)}</td>
              </tr></tfoot>
            </table>
            {viewBarcada.observacoes && <div style={{ background: '#FFF8E1', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#6B7280', marginBottom: 14 }}>📝 {viewBarcada.observacoes}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPrintBarcada(viewBarcada); setViewBarcada(null) }} style={btnP}>🖨️ Imprimir</button>
              <button onClick={() => setViewBarcada(null)} style={btnS}>Fechar</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Modal: Impressão ────────────────────────────────────────────── */}
      {printBarcada && (
        <Overlay>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #EDE8F5' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#3B0A45' }}>Pré-visualização</span>
              <button onClick={() => setPrintBarcada(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
            </div>
            <div style={{ padding: '24px 28px', fontFamily: 'monospace', fontSize: 12 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1 }}>PLANILHA DE CONTROLE DE AÇAÍ</div>
                <div style={{ fontSize: 10, color: '#555' }}>Açaí Tia Maria</div>
              </div>
              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 10 }}>
                <tbody>
                  {[['DATA:', printBarcada.data, 'BARCADA:', printBarcada.numero], ['Nº CXS:', String(printBarcada.num_caixas), 'TIPO:', printBarcada.produto_nome], ['VALOR/LITRO:', formatCurrency(printBarcada.valor_litro_historico), '', '']].map((row, i) => (
                    <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: '3px 4px', fontWeight: j % 2 === 0 ? 700 : 400, width: j % 2 === 0 ? '25%' : '25%' }}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 10 }}>
                <thead><tr style={{ borderTop: '1px solid black', borderBottom: '1px solid black' }}>
                  {['TIPO', 'Nº PACOTES', 'TOTAL LITROS', 'VALOR R$'].map(h => <th key={h} style={{ padding: '4px 6px', textAlign: 'left' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {printBarcada.linhas.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px dotted #ccc' }}>
                      <td style={{ padding: '4px 6px' }}>{l.embalagem_nome}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{l.num_pacotes}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{l.litros_calculados.toFixed(1)} L</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatCurrency(l.total)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid black', fontWeight: 900 }}>
                    <td style={{ padding: '5px 6px' }}>TOTAL</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>{printBarcada.total_pacotes}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>{printBarcada.total_litros.toFixed(1)} L</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>{formatCurrency(printBarcada.valor_total)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: 11 }}>
                <span>RESPONSÁVEL: {printBarcada.responsavel || '_______________'}</span>
                <span>ASSINATURA: _______________</span>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #EDE8F5', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => window.print()} style={btnP}>🖨️ Imprimir</button>
              <button onClick={() => setPrintBarcada(null)} style={btnS}>Fechar</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 200, padding: 16, overflowY: 'auto' }}>{children}</div>
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#3B0A45' }}>{title}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
    </div>
  )
}

function Section({ color, label, children, action }: { color: string; label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5B145F', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>{children}</div>
}

function btnSm(bg: string, color: string): React.CSSProperties {
  return { background: bg, border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 700, color, cursor: 'pointer' }
}

const iS: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: 'white' }
const btnP: React.CSSProperties = { background: '#7A2E83', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
const btnS: React.CSSProperties = { background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
