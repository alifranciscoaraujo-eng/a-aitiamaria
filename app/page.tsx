'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export default function LoginPage() {
  const [email, setEmail] = useState('maria@acaitiamaria.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAppStore(s => s.login)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const ok = login(email, password)
    if (ok) {
      router.push('/dashboard')
    } else {
      setError('Email ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #3B0A45 0%, #5B145F 50%, #7A2E83 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Background decorative circles */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '16px 28px', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
            <img src="/logo.png" alt="Açaí Tia Maria" style={{ height: 110, maxWidth: 280, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: '#3B0A45' }}>Bem-vindo!</h2>
          <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>Faça login para acessar o sistema</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, color: '#111827', transition: 'border-color 0.2s', background: '#FAFAFA' }}
                onFocus={e => (e.target.style.borderColor = '#7A2E83')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                required
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, color: '#111827', transition: 'border-color 0.2s', background: '#FAFAFA' }}
                onFocus={e => (e.target.style.borderColor = '#7A2E83')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #5B145F, #7A2E83)', opacity: loading ? 0.8 : 1, transition: 'all 0.2s' }}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '14px', background: '#F4E8F7', borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: '#7A2E83', fontWeight: 600, margin: '0 0 4px' }}>Demo — Acesso rápido:</p>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>Email: maria@acaitiamaria.com · Senha: qualquer</p>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 24 }}>
          © 2026 Gestão Açaí Tia Maria Pro · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
