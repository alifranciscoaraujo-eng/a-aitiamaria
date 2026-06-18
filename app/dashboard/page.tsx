'use client'
import { useState, useMemo, useEffect } from 'react'
import { useMobile } from '@/lib/useMobile'
import { mockAlerts } from '@/lib/mockData'
import { loadEntries, DailyEntry } from '@/lib/dailyData'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function parseDate(d: string) {
  const [day, month, year] = d.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

type Period = '7d' | '30d' | 'mes' | 'ano' | 'custom'

function aggregate(entries: DailyEntry[]) {
  const diasProd = entries.filter(e => e.cxs > 0).length
  const cxs = entries.reduce((s, e) => s + e.cxs, 0)
  const litros = entries.reduce((s, e) => s + e.litros, 0)
  const custo = entries.reduce((s, e) => s + e.valor_total, 0)
  const valorLitros = entries.reduce((s, e) => s + e.valor_litros, 0)
  const lucro = entries.reduce((s, e) => s + e.lucro_total, 0)
  const gastos = entries.reduce((s, e) => s + e.gastos, 0)
  const vendaAcai = entries.reduce((s, e) => s + e.venda_acai, 0)
  const farinha = entries.reduce((s, e) => s + e.farinha_tapioca, 0)
  const camarao = entries.reduce((s, e) => s + e.camarao, 0)
  const receita = vendaAcai + farinha + camarao
  const margem = receita > 0 ? (lucro / receita) * 100 : 0
  const custoPorLitro = litros > 0 ? custo / litros : 0
  const lucroMedioCx = cxs > 0 ? lucro / cxs : 0
  return { diasProd, cxs, litros, custo, valorLitros, lucro, gastos, vendaAcai, farinha, camarao, receita, margem, custoPorLitro, lucroMedioCx, dias: entries.length }
}

// variação % vs período anterior; undefined quando não há base de comparação
function pctDelta(cur: number, prev: number): number | undefined {
  if (!prev) return undefined
  return ((cur - prev) / Math.abs(prev)) * 100
}

function QuickActionBtn({ icon, label, href }: { icon: string; label: string; href: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '12px 8px', background: 'white', border: '1.5px solid #EDE8F5',
        borderRadius: 14, cursor: 'pointer', transition: 'all 0.18s', width: '100%',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.borderColor = '#7A2E83'; b.style.background = '#F9F4FB'; b.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.borderColor = '#EDE8F5'; b.style.background = 'white'; b.style.transform = 'none'
      }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#5B145F', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}

// Chip de variação vs período anterior
function Trend({ delta, goodWhenUp, size = 'sm' }: { delta?: number; goodWhenUp?: boolean; size?: 'sm' | 'lg' }) {
  if (delta === undefined) return null
  const up = delta >= 0
  const flat = Math.abs(delta) < 0.5
  const good = up === !!goodWhenUp
  const color = flat ? '#9CA3AF' : good ? '#059669' : '#DC2626'
  const arrow = flat ? '→' : up ? '▲' : '▼'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: size === 'lg' ? 12 : 10, fontWeight: 700, padding: size === 'lg' ? '3px 9px' : '2px 7px',
      borderRadius: 20, background: color + '14', color, border: `1px solid ${color}28`, whiteSpace: 'nowrap',
    }}>{arrow} {Math.abs(delta).toFixed(0)}%</span>
  )
}

function HeroCard({ icon, label, value, accent, delta, goodWhenUp, semaforo }: {
  icon: string; label: string; value: string; accent: string
  delta?: number; goodWhenUp?: boolean; semaforo?: string
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 22px', border: '1px solid #EDE8F5',
      boxShadow: '0 2px 10px rgba(59,10,69,0.07)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 5, background: semaforo ?? accent }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: (semaforo ?? accent) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        </div>
        <Trend delta={delta} goodWhenUp={goodWhenUp} size="lg" />
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#1F1235', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#B0B8C1', marginTop: 6 }}>vs. período anterior</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#7A2E83', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>{title}</div>
      {children}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, accent, badge, badgeColor, compact, delta, goodWhenUp }: {
  icon: string; label: string; value: string; sub?: string; accent?: string
  badge?: string; badgeColor?: string; compact?: boolean; delta?: number; goodWhenUp?: boolean
}) {
  const ac = accent ?? '#7A2E83'
  return (
    <div style={{
      background: 'white', borderRadius: 14,
      padding: compact ? '12px 14px' : '16px 18px',
      border: '1px solid #EDE8F5',
      display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8,
      boxShadow: '0 1px 4px rgba(59,10,69,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ac, borderRadius: '14px 14px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        {/* icon with tinted background */}
        <div style={{
          width: compact ? 32 : 36, height: compact ? 32 : 36, borderRadius: 9,
          background: ac + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 16 : 18,
        }}>{icon}</div>
        {badge ? (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
            background: badgeColor ? badgeColor + '18' : '#E8F5E9',
            color: badgeColor ?? '#2E7D32', border: `1px solid ${badgeColor ? badgeColor + '30' : '#C8E6C9'}`,
          }}>{badge}</span>
        ) : <Trend delta={delta} goodWhenUp={goodWhenUp} />}
      </div>

      <div>
        <div style={{ fontSize: compact ? 10 : 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: compact ? 18 : 22, fontWeight: 800, color: '#1F1235', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#B0B8C1', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const today = new Date()
  const isMobile = useMobile()
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([])
  useEffect(() => { loadEntries().then(setAllEntries) }, [])
  const [period, setPeriod] = useState<Period>('mes')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const periodStart = useMemo(() => {
    if (period === '7d') { const d = new Date(today); d.setDate(d.getDate() - 6); return d }
    if (period === '30d') { const d = new Date(today); d.setDate(d.getDate() - 29); return d }
    if (period === 'mes') return new Date(today.getFullYear(), today.getMonth(), 1)
    if (period === 'ano') return new Date(today.getFullYear(), 0, 1)
    if (period === 'custom' && customFrom) return new Date(customFrom)
    return new Date(2026, 0, 1)
  }, [period, customFrom])

  const periodEnd = useMemo(() => {
    if (period === 'custom' && customTo) return new Date(customTo)
    return today
  }, [period, customTo])

  const filtered = useMemo(() =>
    allEntries.filter(e => {
      const d = parseDate(e.data)
      return d >= periodStart && d <= periodEnd
    }),
    [allEntries, periodStart, periodEnd]
  )

  const kpi = useMemo(() => aggregate(filtered), [filtered])

  // Período anterior (mesma janela) para comparação
  const prevRange = useMemo(() => {
    if (period === 'mes') {
      return { s: new Date(today.getFullYear(), today.getMonth() - 1, 1), e: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()) }
    }
    if (period === 'ano') {
      return { s: new Date(today.getFullYear() - 1, 0, 1), e: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()) }
    }
    const lenMs = periodEnd.getTime() - periodStart.getTime()
    const e = new Date(periodStart.getTime() - 86400000)
    const s = new Date(e.getTime() - lenMs)
    return { s, e }
  }, [period, periodStart, periodEnd])

  const prevKpi = useMemo(() => aggregate(
    allEntries.filter(en => { const d = parseDate(en.data); return d >= prevRange.s && d <= prevRange.e })
  ), [allEntries, prevRange])

  // Daily chart — últimos 14 dias do período
  const dailyChart = useMemo(() => {
    const last14 = [...filtered].slice(-14)
    return last14.map(e => ({
      dia: e.data.slice(0, 5),
      lucro: e.lucro_total,
      custo: e.valor_total,
      venda: e.venda_acai,
    }))
  }, [filtered])

  // Monthly chart — sempre usa allEntries para mostrar histórico completo
  const monthlyChart = useMemo(() => {
    const byMonth: Record<string, { key: string; mes: string; lucro: number; custo: number; receita: number; cxs: number }> = {}
    allEntries.forEach(e => {
      const [, m, y] = e.data.split('/')
      const key = `${y}-${m}`
      const label = `${months[Number(m) - 1]}/${y?.slice(2)}`
      if (!byMonth[key]) byMonth[key] = { key, mes: label, lucro: 0, custo: 0, receita: 0, cxs: 0 }
      byMonth[key].lucro += e.lucro_total
      byMonth[key].custo += e.valor_total
      byMonth[key].receita += e.venda_acai + e.farinha_tapioca + e.camarao
      byMonth[key].cxs += e.cxs
    })
    return Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key))
  }, [allEntries])

  const PERIODS: { key: Period; label: string }[] = [
    { key: '7d', label: 'Últimos 7 dias' },
    { key: '30d', label: 'Últimos 30 dias' },
    { key: 'mes', label: 'Este mês' },
    { key: 'ano', label: 'Este ano' },
    { key: 'custom', label: 'Personalizado' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: isMobile ? '12px 14px' : '20px 24px', flex: 1, background: '#F8F5FB' }}>

        {/* Header com filtro de período */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap',
          background: 'white', borderRadius: 14, padding: isMobile ? '10px 12px' : '14px 18px', border: '1px solid #EDE8F5',
          boxShadow: '0 1px 4px rgba(59,10,69,0.05)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5B145F', width: isMobile ? '100%' : 'auto' }}>📅 Período:</span>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: isMobile ? '5px 10px' : '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: period === p.key ? 'none' : '1.5px solid #EDE8F5',
                background: period === p.key ? '#7A2E83' : 'white',
                color: period === p.key ? 'white' : '#6B7280',
                transition: 'all 0.15s',
              }}
            >{p.label}</button>
          ))}
          {period === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #EDE8F5', fontSize: 12, color: '#374151' }} />
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>até</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #EDE8F5', fontSize: 12, color: '#374151' }} />
            </div>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF', background: '#F8F5FB', padding: '4px 10px', borderRadius: 10 }}>
            {kpi.diasProd} dias com produção · {filtered.length} dias no período
          </span>
        </div>

        {/* Ações rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 16 : 24 }}>
          <QuickActionBtn icon="📝" label="Lançamento Diário" href="/dashboard/lancamento" />
          <QuickActionBtn icon="🛒" label="Nova Venda" href="/dashboard/vendas" />
          <QuickActionBtn icon="🫐" label="Nova Barcada" href="/dashboard/producao" />
          <QuickActionBtn icon="🧴" label="Produtos" href="/dashboard/produtos" />
          <QuickActionBtn icon="💰" label="Fechar Caixa" href="/dashboard/caixa" />
          <QuickActionBtn icon="📈" label="Relatórios" href="/dashboard/relatorios" />
        </div>

        {/* Alertas */}
        {mockAlerts.filter(a => a.status === 'ativo').length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {mockAlerts.filter(a => a.status === 'ativo').map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10,
                background: alert.severity === 'error' ? '#FEF2F2' : alert.severity === 'warning' ? '#FFFBEB' : '#EFF6FF',
                border: `1px solid ${alert.severity === 'error' ? '#FECACA' : alert.severity === 'warning' ? '#FDE68A' : '#BFDBFE'}`,
                fontSize: 12,
              }}>
                <span>{alert.severity === 'error' ? '🔴' : alert.severity === 'warning' ? '🟡' : 'ℹ️'}</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{alert.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Linha herói — indicadores principais */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 18 }}>
          <HeroCard icon="💵" label="Receita Total" value={formatCurrency(kpi.receita)} accent="#1D4ED8" delta={pctDelta(kpi.receita, prevKpi.receita)} goodWhenUp />
          <HeroCard icon="💰" label="Lucro Total" value={formatCurrency(kpi.lucro)} accent="#059669" delta={pctDelta(kpi.lucro, prevKpi.lucro)} goodWhenUp />
          <HeroCard icon="🎯" label="Margem" value={`${kpi.margem.toFixed(1)}%`} accent="#059669"
            semaforo={kpi.margem >= 30 ? '#059669' : kpi.margem >= 15 ? '#D97706' : '#DC2626'}
            delta={pctDelta(kpi.margem, prevKpi.margem)} goodWhenUp />
        </div>

        {/* KPIs secundários agrupados por seção */}
        {(() => {
          const grid = { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 14 } as const
          return (
            <>
              <Section title="Produção">
                <div style={grid}>
                  <KpiCard icon="📦" label="Caixas Processadas" value={kpi.cxs.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} sub={`${kpi.diasProd} dias`} accent="#7A2E83" compact={isMobile} delta={pctDelta(kpi.cxs, prevKpi.cxs)} goodWhenUp />
                  <KpiCard icon="🫐" label="Litros Produzidos" value={`${kpi.litros.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L`} accent="#0891B2" compact={isMobile} delta={pctDelta(kpi.litros, prevKpi.litros)} goodWhenUp />
                  <KpiCard icon="🔢" label="Custo / Litro" value={formatCurrency(kpi.custoPorLitro)} accent="#D97706" compact={isMobile} delta={pctDelta(kpi.custoPorLitro, prevKpi.custoPorLitro)} goodWhenUp={false} />
                </div>
              </Section>

              <Section title="Financeiro">
                <div style={grid}>
                  <KpiCard icon="💸" label="Custo Açaí" value={formatCurrency(kpi.custo)} accent="#DC2626" compact={isMobile} delta={pctDelta(kpi.custo, prevKpi.custo)} goodWhenUp={false} />
                  <KpiCard icon="📊" label="Lucro Médio / Cx" value={formatCurrency(kpi.lucroMedioCx)} accent="#059669" compact={isMobile} delta={pctDelta(kpi.lucroMedioCx, prevKpi.lucroMedioCx)} goodWhenUp />
                  <KpiCard icon="🧾" label="Gastos Operac." value={formatCurrency(kpi.gastos)} accent="#7A2E83" compact={isMobile} delta={pctDelta(kpi.gastos, prevKpi.gastos)} goodWhenUp={false} />
                </div>
              </Section>

              <Section title="Vendas">
                <div style={grid}>
                  <KpiCard icon="🛒" label="Venda Açaí" value={formatCurrency(kpi.vendaAcai)} accent="#1D4ED8" compact={isMobile} delta={pctDelta(kpi.vendaAcai, prevKpi.vendaAcai)} goodWhenUp />
                  <KpiCard icon="🍚" label="Venda Farinha/Tapioca" value={formatCurrency(kpi.farinha)} accent="#16A34A" compact={isMobile} delta={pctDelta(kpi.farinha, prevKpi.farinha)} goodWhenUp />
                  <KpiCard icon="🦐" label="Venda Camarão" value={formatCurrency(kpi.camarao)} accent="#EA580C" compact={isMobile} delta={pctDelta(kpi.camarao, prevKpi.camarao)} goodWhenUp />
                </div>
              </Section>
            </>
          )
        })()}

        {/* Gráficos row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 10 : 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 20px 12px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 4 }}>Evolução Diária — Últimos dias do período</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>Lucro, Custo Açaí e Venda Açaí por dia</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={dailyChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCusto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EAF5" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
                <Legend />
                <Area type="monotone" dataKey="lucro" stroke="#2E7D32" fill="url(#gLucro)" strokeWidth={2} name="Lucro" />
                <Area type="monotone" dataKey="custo" stroke="#D32F2F" fill="url(#gCusto)" strokeWidth={2} name="Custo Açaí" />
                <Area type="monotone" dataKey="venda" stroke="#7A2E83" strokeWidth={1.5} fill="none" name="Venda Açaí" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px 20px 12px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 4 }}>Resultado por Mês</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>Receita, Custo e Lucro</div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EAF5" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="receita" fill="#1565C0" name="Receita" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" fill="#D32F2F" name="Custo Açaí" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" fill="#2E7D32" name="Lucro" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico caixas por mês + estoque */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 10 : 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 20px 12px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 2 }}>Caixas &amp; Lucro por Mês</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>Evolução histórica — todos os meses</div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={monthlyChart} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCxs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7A2E83" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7A2E83" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F0F8" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="cxs" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="lucro" orientation="right" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #EDE8F5', borderRadius: 10, fontSize: 12 }}
                  formatter={(v, name) => name === 'Caixas' ? `${Number(v).toFixed(1)} cx` : formatCurrency(Number(v))}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="cxs" dataKey="cxs" name="Caixas" fill="url(#gradCxs)" stroke="#7A2E83" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                <Line yAxisId="lucro" type="monotone" dataKey="lucro" name="Lucro" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 4 }}>💵 Composição da Receita</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>Período selecionado · total {formatCurrency(kpi.receita)}</div>
            {(() => {
              const cats = [
                { label: 'Venda Açaí', value: kpi.vendaAcai, color: '#7A2E83' },
                { label: 'Farinha / Tapioca', value: kpi.farinha, color: '#16A34A' },
                { label: 'Camarão', value: kpi.camarao, color: '#EA580C' },
              ].filter(c => c.value > 0).sort((a, b) => b.value - a.value)
              const total = cats.reduce((s, c) => s + c.value, 0)
              if (total === 0) return <div style={{ fontSize: 12, color: '#9CA3AF' }}>Sem vendas no período.</div>
              return cats.map(c => (
                <div key={c.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{c.label}</span>
                    <span style={{ fontWeight: 700, color: '#1D4ED8', fontSize: 12 }}>{formatCurrency(c.value)}</span>
                  </div>
                  <div style={{ height: 6, background: '#F0EAF5', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.value / total) * 100}%`, height: '100%', background: c.color, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{((c.value / total) * 100).toFixed(1)}% do total</div>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Top 5 dias de maior lucro no período */}
        <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #EDE8F5', boxShadow: '0 1px 4px rgba(59,10,69,0.05)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 4 }}>🏆 Top 5 Dias de Maior Lucro — Período Selecionado</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Melhores resultados dentro do filtro aplicado</div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 13, minWidth: isMobile ? 520 : 'auto' }}>
            <thead>
              <tr style={{ background: '#F8F5FB' }}>
                {['#', 'DATA', 'CAIXAS', 'LITROS', 'CUSTO AÇAÍ', 'VENDA AÇAÍ', 'LUCRO', 'MARGEM'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: h === '#' || h === 'DATA' || h === 'CAIXAS' || h === 'LITROS' ? 'left' : 'right', fontSize: 11, color: '#6B7280', fontWeight: 700, borderBottom: '2px solid #EDE8F5' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .filter(e => e.cxs > 0)
                .sort((a, b) => b.lucro_total - a.lucro_total)
                .slice(0, 5)
                .map((e, i) => {
                  const margem = e.venda_acai > 0 ? (e.lucro_total / e.venda_acai) * 100 : 0
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid #F8F5FB' }}
                      onMouseEnter={ev => (ev.currentTarget as HTMLTableRowElement).style.background = '#FDFAFF'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLTableRowElement).style.background = 'white'}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: ['#F59E0B', '#9CA3AF', '#B45309'][i] ?? '#6B7280' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{e.data}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{e.cxs}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{e.litros} L</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#D32F2F', fontWeight: 600 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.valor_total)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1565C0', fontWeight: 600 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.venda_acai)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#2E7D32', fontWeight: 800 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.lucro_total)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <span style={{ background: margem >= 30 ? '#E8F5E9' : '#FFF8E1', color: margem >= 30 ? '#2E7D32' : '#F57F17', fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 8 }}>
                          {margem.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </div>
  )
}
