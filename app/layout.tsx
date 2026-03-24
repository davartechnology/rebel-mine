import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'REBEL Mine — REBELONE',
  description: 'Mine du REBEL et gagne de l\'argent réel. Première app de l\'écosystème REBELONE.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
