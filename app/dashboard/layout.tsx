'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/')
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated) return null

  const sidebarWidth = isMobile ? 0 : (collapsed ? 64 : 240)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={isMobile ? false : collapsed}
        onToggle={() => isMobile ? setMobileOpen(false) : setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
      />

      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.25s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        <Topbar onMenuClick={() => setMobileOpen(o => !o)} />
        {children}
      </main>
    </div>
  )
}
