'use client'
import { useState } from 'react'
import { mockUsers } from '@/lib/mockData'
import { roleLabel } from '@/lib/utils'
import type { User, UserRole } from '@/lib/types'

const roleColors: Record<string, string> = {
  admin: 'badge-purple', gerente: 'badge-blue', producao: 'badge-green', vendedor: 'badge-yellow', caixa: 'badge-gray', consulta: 'badge-gray'
}

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['Dashboard', 'Produção', 'Envase', 'Estoque', 'Vendas', 'Caixa', 'Despesas', 'Relatórios', 'Clientes', 'Fornecedores', 'Usuários', 'Configurações'],
  gerente: ['Dashboard', 'Produção', 'Envase', 'Estoque', 'Vendas', 'Caixa', 'Despesas', 'Relatórios', 'Clientes', 'Fornecedores'],
  producao: ['Produção', 'Envase', 'Estoque'],
  vendedor: ['Vendas', 'Clientes', 'Estoque (leitura)'],
  caixa: ['Caixa', 'Vendas', 'Despesas'],
  consulta: ['Dashboard (leitura)', 'Relatórios (leitura)'],
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'vendedor' as UserRole, password: '' })
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const u: User = { id: `u${Date.now()}`, name: form.name, email: form.email, role: form.role, status: 'ativo', created_at: new Date().toISOString() }
    setUsers(prev => [...prev, u])
    setShowForm(false)
    setForm({ name: '', email: '', role: 'vendedor', password: '' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: 24 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: '👥', label: `${users.length} Usuários` },
              { icon: '✅', label: `${users.filter(u => u.status === 'ativo').length} Ativos` },
            ].map((s, i) => (
              <div key={i} style={{ background: '#F4E8F7', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#5B145F' }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Novo Usuário</button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(91,20,95,0.12)', border: '1.5px solid #F0EAF5' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 16px' }}>Novo Usuário</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Nome completo', key: 'name' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Senha', key: 'password', type: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                    <input required type={f.type ?? 'text'} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Perfil de acesso</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13 }}>
                    {Object.entries(roleLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">💾 Criar Usuário</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4E8F7', fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>Usuários do Sistema</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                  {['Usuário', 'Email', 'Perfil', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row" style={{ borderBottom: '1px solid #F9F4FB' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #5B145F, #7A2E83)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6B7280' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px' }}><span className={`badge ${roleColors[u.role]}`}>{roleLabel[u.role]}</span></td>
                    <td style={{ padding: '12px 14px' }}><span className={`badge ${u.status === 'ativo' ? 'badge-green' : 'badge-red'}`}>{u.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => setSelectedRole(u.role)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🔑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 16 }}>🔑 Perfis de Acesso</div>
            {(Object.entries(rolePermissions) as [UserRole, string[]][]).map(([role, perms]) => (
              <div key={role} style={{ marginBottom: 14, padding: '12px 14px', background: selectedRole === role ? '#F4E8F7' : '#F9F9F9', borderRadius: 12, border: `1.5px solid ${selectedRole === role ? '#D1C4E9' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setSelectedRole(role === selectedRole ? null : role)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className={`badge ${roleColors[role]}`}>{roleLabel[role]}</span>
                </div>
                {selectedRole === role && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {perms.map(p => (
                      <span key={p} style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>✓ {p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
