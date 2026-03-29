'use client'

import { useState, useEffect, useRef } from 'react'
import AdOverlay from './AdOverlay'
import MineButton from './MineButton'
import BalanceCard from './BalanceCard'
import WithdrawModal from './WithdrawModal'

interface MinePageProps {
  userId: string
  onBalanceUpdate: () => void
}

export default function MinePage({ userId, onBalanceUpdate }: MinePageProps) {
  const [status, setStatus] = useState<'idle' | 'mining' | 'cooldown'>('idle')
  const [balance, setBalance] = useState('0.00000000')
  const [animatedBalance, setAnimatedBalance] = useState('0.00000000')
  const [animating, setAnimating] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [totalMiningCount, setTotalMiningCount] = useState(0)
  const [todayEarned, setTodayEarned] = useState('0.00000000')
  const [showAd, setShowAd] = useState(false)
  const [adType, setAdType] = useState<'video_reward' | 'interstitial'>('video_reward')
  const [sessionId, setSessionId] = useState('')
  const [adToken, setAdToken] = useState('')
  const [miningReward, setMiningReward] = useState(1.0)
  const [animationSeconds, setAnimationSeconds] = useState(300)
  const [rewardFloat, setRewardFloat] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawalCount, setWithdrawalCount] = useState(0)
  const [reservedBalance, setReservedBalance] = useState('0.00000000')
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const cooldownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchStatus()
    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/mining/status')
      const data = await res.json()

      setBalance(data.balance || '0.00000000')
      setAnimatedBalance(data.balance || '0.00000000')
      setTotalMiningCount(data.totalMiningCount || 0)
      setTodayEarned(data.todayEarned || '0.00000000')
      setMiningReward(data.miningReward || 1.0)
      setAnimationSeconds(data.animationSeconds || 300)

      const profileRes = await fetch('/api/user/profile')
      const profileData = await profileRes.json()
      if (profileData.withdrawalCount !== undefined) {
        setWithdrawalCount(profileData.withdrawalCount)
      }

      if (profileData.balance?.reserved) {
        setReservedBalance(
          parseFloat(profileData.balance.reserved).toFixed(8)
        )
      }

      if (data.activeSession) {
        setStatus('mining')
        setSessionId(data.activeSession.id)
        const elapsed = (Date.now() - new Date(data.activeSession.startedAt).getTime()) / 1000
        const remaining = Math.max(0, data.animationSeconds - elapsed)
        startMiningAnimation(parseFloat(data.balance), data.miningReward, remaining, data.activeSession.id)
      } else if (!data.canMine && data.cooldownRemainingSeconds > 0) {
        setStatus('cooldown')
        setCooldownSeconds(data.cooldownRemainingSeconds)
        startCooldownTimer(data.cooldownRemainingSeconds)
      }
    } catch (err) {
      console.error('Status error:', err)
    }
  }

  const handleMineClick = async () => {
    if (status !== 'idle') return

    try {
      const res = await fetch('/api/mining/start', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors du démarrage')
        return
      }

      setSessionId(data.sessionId)
      setAdToken(data.adToken)
      setAdType(data.adType)
      setShowAd(true)
    } catch (err) {
      console.error('Mine start error:', err)
    }
  }

  const handleAdComplete = async () => {
    setShowAd(false)

    try {
      const res = await fetch('/api/mining/verify-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, adToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur de vérification')
        return
      }

      setStatus('mining')
      startMiningAnimation(
        parseFloat(balance),
        miningReward,
        animationSeconds,
        sessionId
      )
    } catch (err) {
      console.error('Ad verify error:', err)
    }
  }

  const startMiningAnimation = (
    startBalance: number,
    reward: number,
    duration: number,
    sid: string
  ) => {
    const startTime = Date.now()
    const endBalance = startBalance + reward

    if (animationRef.current) clearInterval(animationRef.current)

    animationRef.current = setInterval(async () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const current = startBalance + (reward * progress)

      setAnimatedBalance(current.toFixed(8))
      setAnimating(true)

      if (progress >= 1) {
        if (animationRef.current) clearInterval(animationRef.current)

        try {
          const res = await fetch('/api/mining/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid }),
          })

          const data = await res.json()

          if (res.ok) {
            setBalance(data.newBalance)
            setAnimatedBalance(data.newBalance)
            setTotalMiningCount(prev => prev + 1)
            setTodayEarned(prev =>
              (parseFloat(prev) + data.reward).toFixed(8)
            )
            onBalanceUpdate()
            setRewardFloat(true)
            setTimeout(() => setRewardFloat(false), 2000)

            const cooldownRes = await fetch('/api/mining/status')
            const cooldownData = await cooldownRes.json()
            const remaining = cooldownData.cooldownRemainingSeconds || 1200

            setStatus('cooldown')
            setCooldownSeconds(remaining)
            startCooldownTimer(remaining)
          }
        } catch (err) {
          console.error('Complete error:', err)
        }

        setAnimating(false)
      }
    }, 1000)
  }

  const startCooldownTimer = (seconds: number) => {
    let remaining = seconds
    if (cooldownRef.current) clearInterval(cooldownRef.current)

    cooldownRef.current = setInterval(() => {
      remaining -= 1
      setCooldownSeconds(remaining)

      if (remaining <= 0) {
        if (cooldownRef.current) clearInterval(cooldownRef.current)
        setStatus('idle')
        setCooldownSeconds(0)
      }
    }, 1000)
  }

  const withdrawalMinimum = 10
  const progressPercent = Math.min(
    (parseFloat(animating ? animatedBalance : balance) / withdrawalMinimum) * 100,
    100
  )

  const canWithdraw = parseFloat(balance) >= withdrawalMinimum

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      position: 'relative',
    }}>

      {/* AD OVERLAY */}
      {showAd && (
        <AdOverlay adType={adType} onComplete={handleAdComplete} />
      )}

      {/* REWARD FLOAT */}
      {rewardFloat && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '28px',
          fontWeight: 700,
          color: '#16a34a',
          textShadow: '0 0 20px rgba(22,163,74,0.6)',
          pointerEvents: 'none',
          zIndex: 999,
          animation: 'floatUp 2s ease-out forwards',
          letterSpacing: '3px',
        }}>
          +{miningReward.toFixed(8)} RBL
        </div>
      )}

      {/* BALANCE CARD */}
      <BalanceCard
        balance={balance}
        animating={animating}
        animatedBalance={animatedBalance}
      />

      {/* PROGRESS BAR */}
      <div style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: '#4a5568',
          marginBottom: '8px',
          letterSpacing: '1px',
          fontFamily: 'Barlow Condensed, sans-serif',
        }}>
          <span>Progression retrait</span>
          <span>
            {(animating ? animatedBalance : balance)} / {withdrawalMinimum} RBL
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#12151e',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #e8192c, #ff3347)',
            borderRadius: '4px',
            boxShadow: '0 0 10px #e8192c',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* RESERVED TOKEN */}
      {parseFloat(reservedBalance) > 0 && (
        <div style={{
          width: '100%',
          background: 'rgba(26,111,255,0.06)',
          border: '1px solid rgba(26,111,255,0.15)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#4a5568',
              marginBottom: '4px',
            }}>
              🔒 Réserve Token
            </div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '12px',
              color: '#4a5568',
              letterSpacing: '0.5px',
              lineHeight: '1.5',
            }}>
              Transféré au lancement blockchain
            </div>
          </div>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '18px',
            color: '#1a6fff',
            letterSpacing: '1px',
            textAlign: 'right',
          }}>
            {reservedBalance}
            <div style={{
              fontSize: '10px',
              color: '#4a5568',
              letterSpacing: '1px',
              fontFamily: 'Barlow Condensed, sans-serif',
            }}>
              REBEL
            </div>
          </div>
        </div>
      )}


      {/* TOKEN NOTICE */}
      <div style={{
        width: '100%',
        padding: '10px 16px',
        background: 'rgba(26,111,255,0.06)',
        border: '1px solid rgba(26,111,255,0.12)',
        borderRadius: '10px',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: '12px',
        color: '#4a5568',
        letterSpacing: '0.5px',
        textAlign: 'center',
        lineHeight: '1.6',
      }}>
        ℹ️ Token REBEL non lancé · Prix actuel :
        <strong style={{ color: '#e8192c' }}> 0.002$</strong> par REBEL ·
        Retraits via FaucetPay & USDT TRC20
      </div>

      {/* MINE BUTTON */}
      <MineButton
        status={status}
        cooldownSeconds={cooldownSeconds}
        onClick={handleMineClick}
      />

      {/* STATS ROW */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {[
          { value: totalMiningCount.toString(), label: 'Total minages' },
          { value: todayEarned, label: "Aujourd'hui (RBL)" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#12151e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#e8192c',
              letterSpacing: '1px',
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#4a5568',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginTop: '4px',
              fontFamily: 'Barlow Condensed, sans-serif',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* WITHDRAW BUTTON */}
      <button
        onClick={() => canWithdraw && setShowWithdraw(true)}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          border: `1px solid ${canWithdraw
            ? '#16a34a'
            : 'rgba(255,255,255,0.06)'}`,
          background: canWithdraw
            ? 'rgba(22,163,74,0.08)'
            : 'transparent',
          color: canWithdraw ? '#16a34a' : '#4a5568',
          cursor: canWithdraw ? 'pointer' : 'not-allowed',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          transition: 'all 0.3s',
          boxShadow: canWithdraw
            ? '0 0 20px rgba(22,163,74,0.15)'
            : 'none',
        }}
      >
        {canWithdraw
          ? '✅ RETRAIT DISPONIBLE'
          : `🔒 RETRAIT — MIN. ${withdrawalMinimum} REBEL`}
      </button>

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          withdrawalCount={withdrawalCount}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            fetchStatus()
            onBalanceUpdate()
            setShowWithdraw(false)
          }}
        />
      )}

    </div>
  )
}