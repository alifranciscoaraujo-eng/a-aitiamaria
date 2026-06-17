'use client'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { mockAlerts } from '@/lib/mockData'

export default function Topbar({ title }: { title: string }) {
  const { currentUser } = useAppStore()
  const router = useRouter()
  const activeAlerts = mockAlerts.filter(a => a.status === 'ativo').length

  return (
    <header style={{ height: 60, background: 'white', borderBottom: '1px solid #F0EAF5', display: 'flex', alignItems: 'center', paddingInline: 24, gap: 16, position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <h1 style={{ flex: 1, fontSize: 17, fontWeight: 700, color: '#3B0A45', margin: 0 }}>{title}</h1>

      <div style={{ fontSize: 12, color: '#6B7280', background: '#F4E8F7', padding: '4px 12px', borderRadius: 20 }}>
        📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
      </div>

      {/* Alerts bell */}
      <button onClick={() => router.push('/dashboard')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
        🔔
        {activeAlerts > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#D32F2F', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeAlerts}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #5B145F, #7A2E83)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>
          {currentUser?.name.charAt(0) ?? 'U'}
        </div>
        <div style={{ display: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{currentUser?.name}</div>
        </div>
      </div>
    </header>
  )
}
