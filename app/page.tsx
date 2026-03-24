'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import MinePage from '@/components/mining/MinePage'
import ReferralPage from '@/components/layout/ReferralPage'
import HistoryPage from '@/components/layout/HistoryPage'

export default function Home() {
  const [activePage, setActivePage] = useState<'mine' | 'referral' | 'history'>('mine')
  const [balance] = useState('0.00000000')

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
        {activePage === 'mine' && <MinePage />}
        {activePage === 'referral' && <ReferralPage />}
        {activePage === 'history' && <HistoryPage />}
      </main>
    </>
  )
}
