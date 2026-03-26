import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionWrapper from '@/components/layout/SessionWrapper'

export const metadata: Metadata = {
  title: 'REBEL Mine — REBELONE',
  description: 'Mine du REBEL et gagne de l\'argent réel.',
  manifest: '/manifest.json',
  themeColor: '#e8192c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'REBEL Mine',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#e8192c" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <SessionWrapper session={session}>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}
