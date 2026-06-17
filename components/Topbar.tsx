'use client'
import { useAppStore } from '@/lib/store'
import { useRouter, usePathname } from 'next/navigation'
import { mockAlerts } from '@/lib/mockData'
import { useMobile } from '@/lib/useMobile'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/lancamento': 'Lançamento Diário',
  '/dashboard/producao': 'Produção / Barcadas',
  '/dashboard/envase': 'Envase / Pacotes',
  '/dashboard/estoque': 'Estoque',
  '/dashboard/vendas': 'Vendas',
  '/dashboard/caixa': 'Caixa',
  '/dashboard/despesas': 'Despesas',
  '/dashboard/relatorios': 'Relatórios',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/fornecedores': 'Fornecedores',
  '/dashboard/usuarios': 'Usuários',
  '/dashboard/configuracoes': 'Configurações',
}

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { currentUser } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMobile()
  const activeAlerts = mockAlerts.filter(a => a.status === 'ativo').length
  const title = pageTitles[pathname] ?? 'Dashboard'

  return (
    <header style={{
      height: 56,
      background: 'white',
      borderBottom: '1px solid #F0EAF5',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 16,
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Hamburger — mobile only */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3B0A45', flexShrink: 0, padding: 0 }}
        >
          ☰
        </button>
      )}

      <h1 style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </h1>

      {!isMobile && (
        <div style={{ fontSize: 11, color: '#6B7280', background: '#F4E8F7', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}

      <button onClick={() => router.push('/dashboard')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>
        🔔
        {activeAlerts > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#D32F2F', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeAlerts}
          </span>
        )}
      </button>

      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #5B145F, #7A2E83)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
        {currentUser?.name.charAt(0) ?? 'U'}
      </div>
    </header>
  )
}
