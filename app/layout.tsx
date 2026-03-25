import type { Metadata } from 'next'
import './globals.css'
import SessionWrapper from '@/components/layout/SessionWrapper'

export const metadata: Metadata = {
  title: 'REBEL Mine — REBELONE',
  description: 'Mine du REBEL et gagne de l\'argent réel.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SessionWrapper session={null}>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}
