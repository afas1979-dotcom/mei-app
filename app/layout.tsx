import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MEI App — Gestão Financeira',
  description: 'Gerencie sua empresa MEI com facilidade',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
