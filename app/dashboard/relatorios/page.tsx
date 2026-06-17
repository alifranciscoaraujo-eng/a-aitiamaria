'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { dailyRevenueData, monthlyData, productionVsSalesData, paymentMethodData } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const reports = [
  { id: 'diario', icon: 'ðŸ“…', title: 'RelatÃ³rio DiÃ¡rio de ProduÃ§Ã£o', desc: 'Barcadas, litros produzidos e envasados no dia' },
  { id: 'barcadas', icon: 'ðŸ«', title: 'RelatÃ³rio de Barcadas', desc: 'HistÃ³rico completo de barcadas por perÃ­odo' },
  { id: 'estoque', icon: 'ðŸ—„ï¸', title: 'RelatÃ³rio de Estoque', desc: 'PosiÃ§Ã£o atual e movimentaÃ§Ãµes de estoque' },
  { id: 'vendas', icon: 'ðŸ›’', title: 'RelatÃ³rio de Vendas', desc: 'Vendas por produto, vendedor e forma de pagamento' },
  { id: 'caixa', icon: 'ðŸ’°', title: 'RelatÃ³rio de Fechamento de Caixa', desc: 'HistÃ³rico de fechamentos e divergÃªncias' },
  { id: 'despesas', icon: 'ðŸ“‹', title: 'RelatÃ³rio de Despesas', desc: 'Gastos por categoria e perÃ­odo' },
  { id: 'lucro', icon: 'ðŸ“ˆ', title: 'RelatÃ³rio de Lucro', desc: 'Lucro bruto e lÃ­quido por perÃ­odo' },
  { id: 'perdas', icon: 'âš ï¸', title: 'Perdas e DoaÃ§Ãµes', desc: 'HistÃ³rico de perdas, doaÃ§Ãµes e consumo interno' },
  { id: 'fornecedor', icon: 'ðŸš›', title: 'RelatÃ³rio por Fornecedor', desc: 'Volume, custo e rendimento por fornecedor' },
  { id: 'mensal', icon: 'ðŸ“Š', title: 'Consolidado Mensal', desc: 'VisÃ£o completa de faturamento, custo e resultado' },
]

const COLORS = ['#7A2E83', '#2E7D32', '#1565C0', '#FBC02D', '#5B145F']

export default function RelatoriosPage() {
  const [dateFrom, setDateFrom] = useState('2026-06-01')
  const [dateTo, setDateTo] = useState('2026-06-16')
  const [period, setPeriod] = useState('mes')

  function handleExport(type: 'pdf' | 'excel') {
    alert(`Exportando em ${type.toUpperCase()}... (funcionalidade disponÃ­vel na versÃ£o completa)`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="RelatÃ³rios" />
      <div style={{ padding: 24 }}>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#3B0A45' }}>ðŸ“… PerÃ­odo:</span>
          {['hoje', 'ontem', '7dias', 'mes', 'mes_ant'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: period === p ? '#7A2E83' : '#F4E8F7', color: period === p ? 'white' : '#5B145F', transition: 'all 0.2s' }}>
              {p === 'hoje' ? 'Hoje' : p === 'ontem' ? 'Ontem' : p === '7dias' ? 'Ãšltimos 7 dias' : p === 'mes' ? 'MÃªs atual' : 'MÃªs anterior'}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 12 }} />
            <span style={{ color: '#9CA3AF' }}>atÃ©</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 12 }} />
          </div>
          <button className="btn-secondary" onClick={() => handleExport('pdf')}>ðŸ“„ PDF</button>
          <button className="btn-secondary" onClick={() => handleExport('excel')}>ðŸ“Š Excel</button>
        </div>

        {/* KPIs Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { icon: 'ðŸ’µ', label: 'Faturamento', value: formatCurrency(45000) },
            { icon: 'ðŸ’¸', label: 'Despesas', value: formatCurrency(28000) },
            { icon: 'ðŸ’°', label: 'Lucro Bruto', value: formatCurrency(17000) },
            { icon: 'ðŸ“Š', label: 'Margem', value: '37.8%' },
            { icon: 'ðŸ’§', label: 'Litros Vendidos', value: '1.842L' },
          ].map((card, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#3B0A45' }}>{card.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Faturamento vs Lucro</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
                <Legend />
                <Area type="monotone" dataKey="faturamento" stroke="#7A2E83" fill="#F4E8F7" strokeWidth={2} name="Faturamento" />
                <Area type="monotone" dataKey="lucro" stroke="#2E7D32" fill="#E8F5E9" strokeWidth={2} name="Lucro" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>ProduÃ§Ã£o vs Vendas (Litros)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productionVsSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="produzido" fill="#7A2E83" name="Produzido" radius={[4,4,0,0]} />
                <Bar dataKey="vendido" fill="#2E7D32" name="Vendido" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report list */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>ðŸ“‹ RelatÃ³rios DisponÃ­veis</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {reports.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#F9F4FB', borderRadius: 12, border: '1px solid #F0EAF5', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0E6F7')}
                onMouseLeave={e => (e.currentTarget.style.background = '#F9F4FB')}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#3B0A45' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{r.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleExport('pdf')} style={{ background: '#FFEBEE', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#C62828', cursor: 'pointer' }}>PDF</button>
                  <button onClick={() => handleExport('excel')} style={{ background: '#E8F5E9', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#2E7D32', cursor: 'pointer' }}>XLS</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly chart */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Resultado Mensal â€” 2026</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="faturamento" fill="#7A2E83" name="Faturamento" radius={[4,4,0,0]} />
              <Bar dataKey="despesas" fill="#FBC02D" name="Despesas" radius={[4,4,0,0]} />
              <Bar dataKey="lucro" fill="#2E7D32" name="Lucro" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

