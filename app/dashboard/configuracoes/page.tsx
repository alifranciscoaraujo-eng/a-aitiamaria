'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { mockProducts } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<'empresa' | 'produtos' | 'estoque' | 'sistema'>('empresa')
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [company, setCompany] = useState({
    name: 'Açaí Tia Maria',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Palmeiras, 123, Belém - PA',
    phone: '(91) 98765-4321',
    email: 'contato@acaitiamaria.com',
  })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function updateProduct(id: string, field: keyof Product, value: number) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const tabs = [
    { id: 'empresa', icon: '🏢', label: 'Dados da Empresa' },
    { id: 'produtos', icon: '📦', label: 'Produtos e Preços' },
    { id: 'estoque', icon: '🗄️', label: 'Estoque Mínimo' },
    { id: 'sistema', icon: '⚙️', label: 'Sistema' },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Topbar title="Configurações" />
      <div style={{ padding: 24 }}>

        {saved && (
          <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 12, padding: '12px 20px', marginBottom: 16, fontWeight: 600, color: '#2E7D32' }}>
            ✅ Configurações salvas com sucesso!
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F4E8F7', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: tab === t.id ? 'white' : 'transparent', color: tab === t.id ? '#5B145F' : '#9CA3AF', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'empresa' && (
          <div className="card" style={{ maxWidth: 600 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3B0A45', margin: '0 0 20px' }}>🏢 Dados da Empresa</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nome da Empresa', key: 'name' },
                { label: 'CNPJ', key: 'cnpj' },
                { label: 'Endereço', key: 'address' },
                { label: 'Telefone', key: 'phone' },
                { label: 'E-mail', key: 'email', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type ?? 'text'} value={(company as Record<string, string>)[f.key]} onChange={e => setCompany(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14 }} />
                </div>
              ))}
              <button className="btn-primary" onClick={handleSave} style={{ marginTop: 4, alignSelf: 'flex-start' }}>💾 Salvar Dados</button>
            </div>
          </div>
        )}

        {tab === 'produtos' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4E8F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>📦 Produtos e Preços de Venda</span>
              <button className="btn-primary" onClick={handleSave}>💾 Salvar Preços</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EAF5' }}>
                  {['Produto', 'Volume (L)', 'Preço de Venda (R$)', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F9F4FB' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '12px 14px', color: '#6B7280' }}>{p.volume_liters}L</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#6B7280', fontSize: 13 }}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={p.sale_price}
                          onChange={e => updateProduct(p.id, 'sale_price', Number(e.target.value))}
                          style={{ width: 90, padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${p.status === 'ativo' ? 'badge-green' : 'badge-red'}`}>{p.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'estoque' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4E8F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45' }}>🗄️ Estoque Mínimo por Produto</span>
              <button className="btn-primary" onClick={handleSave}>💾 Salvar</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: '#FFF8E1', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400E' }}>
                ⚠️ O sistema emitirá um alerta quando o estoque atingir o nível mínimo definido.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#F9F4FB', borderRadius: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>Atual: {p.current_stock} un</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>Mínimo:</label>
                      <input
                        type="number"
                        value={p.minimum_stock}
                        onChange={e => updateProduct(p.id, 'minimum_stock', Number(e.target.value))}
                        style={{ width: 70, padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'center' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'sistema' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: '🌐 Idioma e Região', fields: [['Idioma', 'Português (BR)'], ['Moeda', 'BRL - Real Brasileiro'], ['Fuso Horário', 'America/Belem (UTC-3)']] },
              { title: '📧 Notificações', fields: [['Email de alertas', 'maria@acaitiamaria.com'], ['Alertas de estoque', 'Ativado'], ['Relatório diário', 'Desativado']] },
              { title: '🔒 Segurança', fields: [['Sessão expira em', '8 horas'], ['Autenticação 2FA', 'Desativado'], ['Log de ações', 'Ativado']] },
              { title: '💾 Backup', fields: [['Backup automático', 'Diário às 22:00'], ['Retenção', '30 dias'], ['Último backup', '16/06/2026 22:00']] },
            ].map(section => (
              <div key={section.title} className="card">
                <div style={{ fontWeight: 700, fontSize: 14, color: '#3B0A45', marginBottom: 14 }}>{section.title}</div>
                {section.fields.map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F4E8F7', fontSize: 13 }}>
                    <span style={{ color: '#6B7280' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{value}</span>
                  </div>
                ))}
                <button className="btn-secondary" onClick={handleSave} style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
