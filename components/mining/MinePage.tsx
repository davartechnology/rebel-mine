'use client'

import { useState, useEffect, useRef } from 'react'

interface MiningStatus {
  canMine: boolean
  cooldownUntil: string | null
  cooldownRemainingSeconds: number
  activeSession: {
    id: number
    startedAt: string
    animationSeconds: number
  } | null
  balance: string
  totalMiningCount: number
  todayEarned: string
  miningReward: number
  animationSeconds: number
  cooldownMinutes: number
}

interface MinePageProps {
  userId: string
  onBalanceUpdate: () => void
}

export default function MinePage({ userId, onBalanceUpdate }: MinePageProps) {
  const [status, setStatus] = useState<MiningStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [miningStartTime, setMiningStartTime] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState('')
  const [miningComplete, setMiningComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch mining status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/mining/status')
      const data = await res.json()
      setStatus(data)
      
      // If there's an active session, set up the timer
      if (data.activeSession) {
        const startTime = new Date(data.activeSession.startedAt).getTime()
        setMiningStartTime(startTime)
      }
    } catch (err) {
      console.error('Failed to fetch mining status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [userId])

  // Timer for active mining session
  useEffect(() => {
    if (miningStartTime && status?.activeSession) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - miningStartTime) / 1000)
        setElapsedSeconds(elapsed)
        
        // Auto-complete when 5 minutes passed
        if (elapsed >= 300 && !miningComplete) {
          completeMining(status.activeSession!.id)
        }
      }, 1000)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [miningStartTime, status?.activeSession])

  // Timer for cooldown countdown
  useEffect(() => {
    if (!status?.canMine && !status?.activeSession && (status?.cooldownRemainingSeconds ?? 0) > 0) {
      intervalRef.current = setInterval(() => {
        setStatus(prev => prev ? {
          ...prev,
          cooldownRemainingSeconds: Math.max(0, (prev.cooldownRemainingSeconds ?? 0) - 1)
        } : null)
      }, 1000)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [status?.canMine, status?.activeSession, status?.cooldownRemainingSeconds])

  const startMining = async () => {
    setError('')
    try {
      const res = await fetch('/api/mining/start', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors du démarrage')
        return
      }

      // Refresh status to get active session
      await fetchStatus()
    } catch (err) {
      setError('Erreur de connexion')
    }
  }

  const completeMining = async (sessionId: number) => {
    try {
      const res = await fetch('/api/mining/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMiningComplete(true)
        setTimeout(() => {
          setMiningComplete(false)
          fetchStatus()
          onBalanceUpdate()
        }, 2000)
      }
    } catch (err) {
      console.error('Complete mining error:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal)
    if (num >= 10) return num.toFixed(2)
    return num.toFixed(8)
  }

  // Calculate progress toward minimum withdrawal
  const balanceNum = status ? parseFloat(status.balance) : 0
  const progress = Math.min((balanceNum / 10) * 100, 100)

  if (loading) {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '30px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '14px',
          color: '#4a5568',
          letterSpacing: '3px',
        }}>
          CHARGEMENT...
        </div>
      </div>
    )
  }

  const isMining = !!status?.activeSession
  const isOnCooldown = !status?.canMine && !status?.activeSession

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
    }}>

      {/* BALANCE CARD */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #12151e 0%, #0a2035 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Mining complete flash */}
        {miningComplete && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(232,25,44,0.3)',
            animation: 'flash 0.5s ease',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#4a5568',
          textTransform: 'uppercase',
          marginBottom: '8px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 600,
        }}>
          Solde actuel
        </div>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '32px',
          fontWeight: 900,
          color: miningComplete ? '#16a34a' : '#e8192c',
          lineHeight: 1,
          textShadow: miningComplete 
            ? '0 0 30px rgba(22,163,74,0.4)' 
            : '0 0 30px rgba(232,25,44,0.4)',
          letterSpacing: '2px',
          transition: 'all 0.3s',
        }}>
          {miningComplete ? 'MINAGE TERMINÉ !' : formatBalance(status?.balance || '0')}
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '14px',
          color: '#4a5568',
          marginTop: '6px',
          letterSpacing: '3px',
        }}>
          {miningComplete ? `+${status?.miningReward} REBEL` : 'REBEL'}
        </div>
      </div>

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
          <span>{formatBalance(status?.balance || '0')} / 10 RBL</span>
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
            width: `${progress}%`,
            background: progress >= 100 
              ? 'linear-gradient(90deg, #16a34a, #22c55e)' 
              : 'linear-gradient(90deg, #e8192c, #ff3347)',
            borderRadius: '4px',
            boxShadow: progress >= 100 
              ? '0 0 10px #16a34a' 
              : '0 0 10px #e8192c',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* MINE BUTTON */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '220px',
        width: '220px',
      }}>
        {/* Orbit ring */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '1px dashed rgba(232,25,44,0.2)',
          animation: isMining ? 'spin 8s linear infinite' : 'none',
        }} />

        {/* Progress ring for mining */}
        {isMining && (
          <svg style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            transform: 'rotate(-90deg)',
          }}>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(232,25,44,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e8192c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(elapsedSeconds / 300) * 565} 565`}
              style={{ transition: 'stroke-dasharray 0.5s' }}
            />
          </svg>
        )}

        {/* Main button */}
        <button
          onClick={startMining}
          disabled={isMining || isOnCooldown}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            border: `2px solid ${isMining ? '#16a34a' : isOnCooldown ? '#4a5568' : '#e8192c'}`,
            cursor: isMining || isOnCooldown ? 'default' : 'pointer',
            background: isMining 
              ? 'radial-gradient(circle at 35% 35%, #052e16, #080a0f)'
              : isOnCooldown
                ? 'radial-gradient(circle at 35% 35%, #1a202c, #080a0f)'
                : 'radial-gradient(circle at 35% 35%, #2a0508, #080a0f)',
            boxShadow: isMining 
              ? '0 0 0 6px rgba(22,163,74,0.05), 0 0 40px rgba(22,163,74,0.2)'
              : isOnCooldown
                ? 'none'
                : '0 0 0 6px rgba(232,25,44,0.05), 0 0 40px rgba(232,25,44,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            position: 'relative',
            zIndex: 2,
            transition: 'all 0.15s',
          }}
        >
          {isMining ? (
            <>
              <span style={{ fontSize: '32px' }}>⏳</span>
              <span style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#16a34a',
              }}>
                {formatTime(elapsedSeconds)}
              </span>
            </>
          ) : isOnCooldown ? (
            <>
              <span style={{ fontSize: '32px' }}>🔒</span>
              <span style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#4a5568',
              }}>
                {formatTime(status?.cooldownRemainingSeconds || 0)}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '36px' }}>⛏️</span>
              <span style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#e8192c',
              }}>
                MINER
              </span>
            </>
          )}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          background: 'rgba(232,25,44,0.1)',
          border: '1px solid rgba(232,25,44,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#ff3347',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '13px',
          letterSpacing: '0.5px',
          width: '100%',
          textAlign: 'center',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* STATS ROW */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {[
          { value: status?.totalMiningCount?.toString() || '0', label: 'Total minages' },
          { value: formatBalance(status?.todayEarned || '0'), label: "Aujourd'hui (RBL)" },
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
              fontSize: '20px',
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
        disabled={!status || balanceNum < 10}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)',
          background: balanceNum >= 10 
            ? 'linear-gradient(135deg, #e8192c, #cc1526)'
            : 'transparent',
          color: balanceNum >= 10 ? '#ffffff' : '#4a5568',
          cursor: balanceNum >= 10 ? 'pointer' : 'not-allowed',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          boxShadow: balanceNum >= 10 ? '0 4px 20px rgba(232,25,44,0.3)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {balanceNum >= 10 
          ? '💰 RETIRER MES REBEL' 
          : `🔒 RETRAIT — MIN. 10 REBEL (${balanceNum.toFixed(2)}/10)`}
      </button>

    </div>
  )
}