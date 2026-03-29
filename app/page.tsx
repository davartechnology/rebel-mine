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

  // Navigation
  const [activePage, setActivePage] = useState<'mine' | 'referral' | 'history'>('mine')

  // Balance globale
  const [balance, setBalance] = useState('0.00000000')

  // State minage persistant entre les pages
  const [miningStatus, setMiningStatus] = useState<'idle' | 'mining' | 'cooldown'>('idle')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [miningStartedAt, setMiningStartedAt] = useState<number | null>(null)
  const [animationSeconds, setAnimationSeconds] = useState(300)
  const [miningReward, setMiningReward] = useState(1.0)
  const [withdrawalCount, setWithdrawalCount] = useState(0)
  const [reservedBalance, setReservedBalance] = useState('0.00000000')
  const [totalMiningCount, setTotalMiningCount] = useState(0)
  const [todayEarned, setTodayEarned] = useState('0.00000000')

  // Refs pour les timers — persistants entre les rendus
  const cooldownRef = useRef<NodeJS.Timeout | null>(null)
  const miningRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchStatus()
    }
  }, [session])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
      if (miningRef.current) clearInterval(miningRef.current)
    }
  }, [])

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

  const fetchStatus = async () => {
    try {
      const [statusRes, profileRes] = await Promise.all([
        fetch('/api/mining/status'),
        fetch('/api/user/profile'),
      ])

      const statusData = await statusRes.json()
      const profileData = await profileRes.json()

      // Mettre à jour le balance
      if (statusData.balance) {
        setBalance(parseFloat(statusData.balance).toFixed(8))
      }

      // Mettre à jour les stats
      setTotalMiningCount(statusData.totalMiningCount || 0)
      setTodayEarned(statusData.todayEarned || '0.00000000')
      setMiningReward(statusData.miningReward || 1.0)
      setAnimationSeconds(statusData.animationSeconds || 300)

      // Mettre à jour le profil
      if (profileData.withdrawalCount !== undefined) {
        setWithdrawalCount(profileData.withdrawalCount)
      }
      if (profileData.balance?.reserved) {
        setReservedBalance(
          parseFloat(profileData.balance.reserved).toFixed(8)
        )
      }

      // Gérer le statut du minage
      if (statusData.activeSession) {
        setMiningStatus('mining')
        setSessionId(statusData.activeSession.id)

        const startedAt = new Date(statusData.activeSession.startedAt).getTime()
        const elapsed = (Date.now() - startedAt) / 1000
        const remaining = Math.max(0, statusData.animationSeconds - elapsed)

        // Calculer le solde actuel basé sur le temps écoulé
        const currentProgress = Math.min(elapsed / statusData.animationSeconds, 1)
        const baseBalance = parseFloat(statusData.balance) - (statusData.miningReward * currentProgress)
        const startBalance = Math.max(0, baseBalance)

        if (remaining > 0) {
          // Minage encore en cours — reprendre l'animation au bon point
          startMiningTimer(
            remaining,
            statusData.activeSession.id,
            startBalance,
            statusData.miningReward
          )
        } else {
          // Le minage est terminé côté temps mais pas encore complété
          // On le complète immédiatement
          fetch('/api/mining/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: statusData.activeSession.id }),
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json()
              setBalance(data.newBalance)
              setMiningStatus('cooldown')
              const remaining = data.cooldownRemainingSeconds || 1200
              setCooldownSeconds(remaining)
              startCooldownTimer(remaining)
            }
          }).catch(console.error)
        }
      } else if (!statusData.canMine && statusData.cooldownRemainingSeconds > 0) {
        // Cooldown en cours
        setMiningStatus('cooldown')
        setCooldownSeconds(statusData.cooldownRemainingSeconds)
        startCooldownTimer(statusData.cooldownRemainingSeconds)
      } else {
        setMiningStatus('idle')
      }

    } catch (err) {
      console.error('Status error:', err)
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

  const startMiningTimer = (
    duration: number,
    sid: string,
    startBalance: number,
    reward: number
  ) => {
    if (miningRef.current) clearInterval(miningRef.current)
    const startTime = Date.now()

    miningRef.current = setInterval(async () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const current = startBalance + (reward * progress)

      setBalance(current.toFixed(8))

      if (progress >= 1) {
        if (miningRef.current) clearInterval(miningRef.current)

        try {
          const res = await fetch('/api/mining/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid }),
          })

          const data = await res.json()

          if (res.ok) {
            setBalance(data.newBalance)
            setTotalMiningCount(prev => prev + 1)
            setTodayEarned(prev =>
              (parseFloat(prev) + data.reward).toFixed(8)
            )

            // Récupérer le cooldown
            const statusRes = await fetch('/api/mining/status')
            const statusData = await statusRes.json()
            const remaining = statusData.cooldownRemainingSeconds || 1200

            setMiningStatus('cooldown')
            setCooldownSeconds(remaining)
            startCooldownTimer(remaining)
          }
        } catch (err) {
          console.error('Complete error:', err)
        }
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
            onMiningStart={(sid, adTok, adT) => {
              setSessionId(sid)
            }}
            onMiningComplete={() => {
              fetchBalance()
              fetchStatus()
            }}
            onStatusChange={setMiningStatus}
            onCooldownStart={startCooldownTimer}
            onMiningTimerStart={startMiningTimer}
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
      <AdBanner hidden={false} />
    </>
  )
}
