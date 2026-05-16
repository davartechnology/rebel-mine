'use client'

import { useState, useEffect, useRef } from 'react'
import AdOverlay from './AdOverlay'
import MineButton from './MineButton'
import BalanceCard from './BalanceCard'
import WithdrawModal from './WithdrawModal'

interface MinePageProps {
  userId: string
  balance: string
  miningStatus: 'idle' | 'mining' | 'cooldown'
  cooldownSeconds: number
  totalMiningCount: number
  todayEarned: string
  miningReward: number
  animationSeconds: number
  withdrawalCount: number
  reservedBalance: string
  sessionId: string
  miningElapsed: number
  onMiningStart: (sid: string) => void
  onMiningComplete: () => void
  onStatusChange: (status: 'idle' | 'mining' | 'cooldown') => void
  onCooldownStart: (seconds: number) => void
  onMiningTimerStart: (remaining: number, sid: string) => void
  onBalanceUpdate: () => void
  onBalanceChange: (balance: string) => void
}

export default function MinePage({
  userId,
  balance,
  miningStatus,
  cooldownSeconds,
  totalMiningCount,
  todayEarned,
  miningReward,
  animationSeconds,
  withdrawalCount,
  reservedBalance,
  sessionId,
  miningElapsed,
  onMiningStart,
  onMiningComplete,
  onStatusChange,
  onCooldownStart,
  onMiningTimerStart,
  onBalanceUpdate,
  onBalanceChange,
}: MinePageProps) {
  const [showAd, setShowAd] = useState(false)
  const [adType, setAdType] = useState<'video_reward' | 'interstitial'>('video_reward')
  const [currentAdToken, setCurrentAdToken] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)

  // Animation visuelle du solde — uniquement pour l'effet
  const [displayBalance, setDisplayBalance] = useState(balance)
  const animRef = useRef<NodeJS.Timeout | null>(null)

  // Synchroniser le displayBalance avec le vrai solde
  // quand on n'est pas en train de miner
  useEffect(() => {
    if (miningStatus !== 'mining') {
      setDisplayBalance(balance)
    }
  }, [balance, miningStatus])

  // Animation visuelle quand le minage commence
  useEffect(() => {
    if (miningStatus === 'mining') {
      if (animRef.current) clearInterval(animRef.current)

      const baseBalance = parseFloat(balance)
      const elapsed = miningElapsed
      const totalDuration = animationSeconds

      const start = Date.now() - (elapsed * 1000)

      animRef.current = setInterval(() => {
        const nowElapsed = (Date.now() - start) / 1000
        const progress = Math.min(nowElapsed / totalDuration, 1)
        const visual = baseBalance + (miningReward * progress)
        setDisplayBalance(visual.toFixed(8))

        if (progress >= 1) {
          if (animRef.current) clearInterval(animRef.current)
        }
      }, 500)
    } else {
      if (animRef.current) clearInterval(animRef.current)
      setDisplayBalance(balance)
    }

    return () => {
      if (animRef.current) clearInterval(animRef.current)
    }
  }, [miningStatus])

  const withdrawalMinimum = 10
  const progressPercent = Math.min(
    (parseFloat(balance) / withdrawalMinimum) * 100,
    100
  )
  const canWithdraw = parseFloat(balance) >= withdrawalMinimum

  const handleMineClick = async () => {
    if (miningStatus !== 'idle') return

    try {
      const res = await fetch('/api/mining/start', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors du démarrage')
        return
      }

      setCurrentSessionId(data.sessionId)
      setCurrentAdToken(data.adToken)
      setAdType(data.adType)
      setShowAd(true)
      onMiningStart(data.sessionId)
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
        body: JSON.stringify({
          sessionId: currentSessionId,
          adToken: currentAdToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur de vérification')
        return
      }

      onStatusChange('mining')
      onMiningTimerStart(animationSeconds, currentSessionId)

    } catch (err) {
      console.error('Ad verify error:', err)
    }
  }

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

      {showAd && (
        <AdOverlay adType={adType} onComplete={handleAdComplete} />
      )}

      <BalanceCard
        balance={balance}
        animating={miningStatus === 'mining'}
        animatedBalance={displayBalance}
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
          <span>{balance} / {withdrawalMinimum} SHE</span>
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

      {/* RESERVED BALANCE */}
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
              SHEE
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
        ℹ️ Token SHEE non lancé · Prix actuel :
        <strong style={{ color: '#e8192c' }}> 0.002$</strong> par SHEE ·
        Retraits via FaucetPay & USDT TRC20
      </div>

      <MineButton
        status={miningStatus}
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
          { value: todayEarned, label: "Aujourd'hui (SHE)" },
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
          : `🔒 RETRAIT — MIN. ${withdrawalMinimum} SHEE`}
      </button>

      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          withdrawalCount={withdrawalCount}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            onBalanceUpdate()
            setShowWithdraw(false)
          }}
        />
      )}

    </div>
  )
}