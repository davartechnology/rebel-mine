'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import MinePage from '@/components/mining/MinePage'
import ReferralPage from '@/components/layout/ReferralPage'
import HistoryPage from '@/components/layout/HistoryPage'
import AdBanner from '@/components/layout/AdBanner'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activePage, setActivePage] = useState<'mine' | 'referral' | 'history'>('mine')
  const [balance, setBalance] = useState('0.00000000')
  const [miningStatus, setMiningStatus] = useState<'idle' | 'mining' | 'cooldown'>('idle')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [animationSeconds, setAnimationSeconds] = useState(300)
  const [miningReward, setMiningReward] = useState(1.0)
  const [withdrawalCount, setWithdrawalCount] = useState(0)
  const [reservedBalance, setReservedBalance] = useState('0.00000000')
  const [totalMiningCount, setTotalMiningCount] = useState(0)
  const [todayEarned, setTodayEarned] = useState('0.00000000')
  const [miningElapsed, setMiningElapsed] = useState(0)

  const cooldownRef = useRef<NodeJS.Timeout | null>(null)
  const miningRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) fetchStatus()
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
      if (miningRef.current) clearInterval(miningRef.current)
    }
  }, [session])

  const fetchStatus = async () => {
    try {
      const [statusRes, profileRes] = await Promise.all([
        fetch('/api/mining/status'),
        fetch('/api/user/profile'),
      ])
      const statusData = await statusRes.json()
      const profileData = await profileRes.json()

      // Toujours afficher le vrai solde DB
      const realBalance = parseFloat(statusData.balance || 0)
      setBalance(realBalance.toFixed(8))

      setTotalMiningCount(statusData.totalMiningCount || 0)
      setTodayEarned(statusData.todayEarned || '0.00000000')
      setMiningReward(statusData.miningReward || 1.0)
      setAnimationSeconds(statusData.animationSeconds || 300)

      if (profileData.withdrawalCount !== undefined) {
        setWithdrawalCount(profileData.withdrawalCount)
      }
      if (profileData.balance?.reserved) {
        setReservedBalance(
          parseFloat(profileData.balance.reserved).toFixed(8)
        )
      }

      if (statusData.activeSession) {
        // Session active — calculer le temps écoulé
        const startedAt = new Date(
          statusData.activeSession.startedAt
        ).getTime()
        const elapsed = Math.floor(
          (Date.now() - startedAt) / 1000
        )
        const remaining = Math.max(
          0,
          statusData.animationSeconds - elapsed
        )

        setSessionId(statusData.activeSession.id)
        setMiningElapsed(elapsed)

        if (remaining > 0) {
          setMiningStatus('mining')
          startCooldownMiningTimer(
            remaining,
            statusData.activeSession.id
          )
        } else {
          // Temps écoulé — compléter
          completeMining(statusData.activeSession.id)
        }

      } else if (
        !statusData.canMine &&
        statusData.cooldownRemainingSeconds > 0
      ) {
        setMiningStatus('cooldown')
        setCooldownSeconds(statusData.cooldownRemainingSeconds)
        startCooldownTimer(statusData.cooldownRemainingSeconds)
      } else {
        setMiningStatus('idle')
      }

    } catch (err) {
      console.error('fetchStatus error:', err)
    }
  }

  const startCooldownMiningTimer = (
    remaining: number,
    sid: string
  ) => {
    if (miningRef.current) clearInterval(miningRef.current)
    let secondsLeft = remaining

    miningRef.current = setInterval(async () => {
      secondsLeft -= 1

      if (secondsLeft <= 0) {
        if (miningRef.current) clearInterval(miningRef.current)
        completeMining(sid)
      }
    }, 1000)
  }

  const completeMining = async (sid: string) => {
    try {
      const res = await fetch('/api/mining/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      })

      if (res.ok) {
        const data = await res.json()
        // Mettre à jour le solde avec la vraie valeur DB
        setBalance(parseFloat(data.newBalance).toFixed(8))
        setTotalMiningCount(prev => prev + 1)
        setTodayEarned(prev =>
          (parseFloat(prev) + data.reward).toFixed(8)
        )

        const statusRes = await fetch('/api/mining/status')
        const statusData = await statusRes.json()
        const remaining = statusData.cooldownRemainingSeconds || 1200

        setMiningStatus('cooldown')
        setCooldownSeconds(remaining)
        startCooldownTimer(remaining)
      }
    } catch (err) {
      console.error('completeMining error:', err)
    }
  }

  const startCooldownTimer = (seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    let remaining = seconds

    cooldownRef.current = setInterval(() => {
      remaining -= 1
      setCooldownSeconds(remaining)

      if (remaining <= 0) {
        if (cooldownRef.current) clearInterval(cooldownRef.current)
        setMiningStatus('idle')
        setCooldownSeconds(0)
      }
    }, 1000)
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
        paddingTop: '64px',
        paddingBottom: '144px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}>
        {activePage === 'mine' && (
          <MinePage
            userId={session.user.id}
            balance={balance}
            miningStatus={miningStatus}
            cooldownSeconds={cooldownSeconds}
            totalMiningCount={totalMiningCount}
            todayEarned={todayEarned}
            miningReward={miningReward}
            animationSeconds={animationSeconds}
            withdrawalCount={withdrawalCount}
            reservedBalance={reservedBalance}
            sessionId={sessionId}
            miningElapsed={miningElapsed}
            onMiningStart={(sid) => setSessionId(sid)}
            onMiningComplete={() => fetchStatus()}
            onStatusChange={setMiningStatus}
            onCooldownStart={startCooldownTimer}
            onMiningTimerStart={startCooldownMiningTimer}
            onBalanceUpdate={fetchStatus}
            onBalanceChange={setBalance}
          />
        )}
        {activePage === 'referral' && (
          <ReferralPage userId={session.user.id} />
        )}
        {activePage === 'history' && (
          <HistoryPage userId={session.user.id} />
        )}
      </main>
      <AdBanner hidden={false} />
    </>
  )
}
