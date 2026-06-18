'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

const nav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/dashboard/lancamento', icon: '📝', label: 'Lançamento Diário' },
  { href: '/dashboard/producao', icon: '🫐', label: 'Produção / Barcadas' },
  { href: '/dashboard/produtos', icon: '🧴', label: 'Produtos' },
  { href: '/dashboard/vendas', icon: '🛒', label: 'Vendas' },
  { href: '/dashboard/caixa', icon: '💰', label: 'Caixa' },
  { href: '/dashboard/despesas', icon: '📋', label: 'Despesas' },
  { href: '/dashboard/relatorios', icon: '📈', label: 'Relatórios' },
  { href: '/dashboard/clientes', icon: '👥', label: 'Clientes' },
  { href: '/dashboard/fornecedores', icon: '🚛', label: 'Fornecedores' },
  { href: '/dashboard/usuarios', icon: '🔑', label: 'Usuários' },
  { href: '/dashboard/configuracoes', icon: '⚙️', label: 'Configurações' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  isMobile?: boolean
}

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout } = useAppStore()

  function handleLogout() {
    logout()
    router.push('/')
  }

  function handleNav(href: string) {
    router.push(href)
    if (isMobile) onToggle()
  }

  const width = collapsed ? 64 : 240

  return (
    <aside style={{
      width,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #3B0A45 0%, #5B145F 60%, #7A2E83 100%)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.25s ease, width 0.25s ease',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
      overflow: 'hidden',
      transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '14px 10px' : '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {collapsed ? (
          <span style={{ fontSize: 26, flexShrink: 0 }}>🫐</span>
        ) : (
          <img
            src="/logo.png"
            alt="Açaí Tia Maria"
            style={{ height: 56, maxWidth: 176, objectFit: 'contain', display: 'block' }}
            onError={e => {
              const img = e.currentTarget
              img.style.display = 'none'
              const fallback = img.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        )}
        {!collapsed && (
          <div style={{ display: 'none', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Gestão Açaí</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Tia Maria Pro</span>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 18, padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {isMobile ? '✕' : (collapsed ? '›' : '‹')}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {nav.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={`sidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
              style={{ marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 13 }}>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {!collapsed && currentUser && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{currentUser.role}</div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%' }}>
          <span style={{ fontSize: 17 }}>🚪</span>
          {!collapsed && <span style={{ fontSize: 13 }}>Sair</span>}
        </button>
        {!collapsed && (
          <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.4 }}>
            Desenvolvido por<br />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Manga Consulting</span>
          </div>
        )}
      </div>
    </aside>
  )
}
