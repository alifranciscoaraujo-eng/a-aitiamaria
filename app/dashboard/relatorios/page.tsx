'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { dailyRevenueData, monthlyData, productionVsSalesData, paymentMethodData } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const reports = [
  { id: 'diario', icon: '📅', title: 'Relatório Diário de Produção', desc: 'Barcadas, litros produzidos e envasados no dia' },
  { id: 'barcadas', icon: '🫐', title: 'Relatório de Barcadas', desc: 'Histórico completo de barcadas por período' },
  { id: 'estoque', icon: '🗄️', title: 'Relatório de Estoque', desc: 'Posição atual e movimentações de estoque' },
  { id: 'vendas', icon: '🛒', title: 'Relatório de Vendas', desc: 'Vendas por produto, vendedor e forma de pagamento' },
  { id: 'caixa', icon: '💰', title: 'Relatório de Fechamento de Caixa', desc: 'Histórico de fechamentos e divergências' },
  { id: 'despesas', icon: '📋', title: 'Relatório de Despesas', desc: 'Gastos por categoria e período' },
  { id: 'lucro', icon: '📈', title: 'Relatório de Lucro', desc: 'Lucro bruto e líquido por período' },
  { id: 'perdas', icon: '⚠️', title: 'Perdas e Doações', desc: 'Histórico de perdas, doações e consumo interno' },
  { id: 'fornecedor', icon: '🚛', title: 'Relatório por Fornecedor', desc: 'Volume, custo e rendimento por fornecedor' },
  { id: 'mensal', icon: '📊', title: 'Consolidado Mensal', desc: 'Visão completa de faturamento, custo e resultado' },
]

const COLORS = ['#7A2E83', '#2E7D32', '#1565C0', '#FBC02D', '#5B145F']

export default function RelatoriosPage() {
  const [dateFrom, setDateFrom] = useState('2026-06-01')
  const [dateTo, setDateTo] = useState('2026-06-16')
  const [period, setPeriod] = useState('mes')

  function handleExport(type: 'pdf' | 'excel') {
    alert(`Exportando em ${type.toUpperCase()}... (funcionalidade disponível na versão completa)`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="Relatórios" />
      <div style={{ padding: 24 }}>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#3B0A45' }}>📅 Período:</span>
          {['hoje', 'ontem', '7dias', 'mes', 'mes_ant'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: period === p ? '#7A2E83' : '#F4E8F7', color: period === p ? 'white' : '#5B145F', transition: 'all 0.2s' }}>
              {p === 'hoje' ? 'Hoje' : p === 'ontem' ? 'Ontem' : p === '7dias' ? 'Últimos 7 dias' : p === 'mes' ? 'Mês atual' : 'Mês anterior'}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 12 }} />
            <span style={{ color: '#9CA3AF' }}>até</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 9, fontSize: 12 }} />
          </div>
          <button className="btn-secondary" onClick={() => handleExport('pdf')}>📄 PDF</button>
          <button className="btn-secondary" onClick={() => handleExport('excel')}>📊 Excel</button>
        </div>

        {/* KPIs Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '💵', label: 'Faturamento', value: formatCurrency(45000) },
            { icon: '💸', label: 'Despesas', value: formatCurrency(28000) },
            { icon: '💰', label: 'Lucro Bruto', value: formatCurrency(17000) },
            { icon: '📊', label: 'Margem', value: '37.8%' },
            { icon: '💧', label: 'Litros Vendidos', value: '1.842L' },
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
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Produção vs Vendas (Litros)</div>
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
          <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>📋 Relatórios Disponíveis</div>
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
          <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>Resultado Mensal — 2026</div>
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
