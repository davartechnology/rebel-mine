'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import MinePage from '@/components/mining/MinePage'
import ReferralPage from '@/components/layout/ReferralPage'
import HistoryPage from '@/components/layout/HistoryPage'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activePage, setActivePage] = useState<'mine' | 'referral' | 'history'>('mine')
  const [balance, setBalance] = useState('0.00000000')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance()
    }
  }, [session])

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/wallet/balance')
      const data = await res.json()
      if (data.balance !== undefined) {
        setBalance(parseFloat(data.balance).toFixed(8))
      }
    } catch (err) {
      console.error('Balance fetch error:', err)
    }
  }

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '32px',
          letterSpacing: '6px',
          background: 'linear-gradient(135deg, #e8192c, #ff3347)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'pulse 1.5s ease infinite',
        }}>
          REBEL MINE
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '12px',
          letterSpacing: '3px',
          color: '#4a5568',
          textTransform: 'uppercase',
        }}>
          Chargement...
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <>
      <Navbar
        activePage={activePage}
        onPageChange={setActivePage}
        balance={balance}
      />
      <main style={{
        paddingTop: '80px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}>
        {activePage === 'mine' && (
          <MinePage
            userId={session.user.id}
            onBalanceUpdate={fetchBalance}
          />
        )}
        {activePage === 'referral' && (
          <ReferralPage userId={session.user.id} />
        )}
        {activePage === 'history' && (
          <HistoryPage userId={session.user.id} />
        )}
      </main>
    </>
  )
}
