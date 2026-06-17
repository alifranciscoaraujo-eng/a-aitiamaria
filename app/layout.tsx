import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestão Açaí Tia Maria Pro',
  description: 'Sistema de gestão profissional para empresas de açaí',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
