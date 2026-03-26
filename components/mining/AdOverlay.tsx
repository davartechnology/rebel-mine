'use client'

import { useState, useEffect } from 'react'

interface AdOverlayProps {
  adType: 'video_reward' | 'interstitial'
  onComplete: () => void
}

export default function AdOverlay({ adType, onComplete }: AdOverlayProps) {
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(adType === 'video_reward' ? 30 : 5)
  const [canClose, setCanClose] = useState(false)

  useEffect(() => {
    const duration = adType === 'video_reward' ? 30000 : 5000
    const interval = 100
    const start = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)

      const remaining = Math.max(
        0,
        Math.ceil((duration - elapsed) / 1000)
      )
      setCountdown(remaining)

      if (pct >= 100) {
        clearInterval(timer)
        setCanClose(true)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [adType])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      animation: 'slideUp 0.3s ease',
    }}>
      <div style={{
        background: '#0d1018',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '400px',
        overflow: 'hidden',
      }}>

        {/* HEADER */}
        <div style={{
          background: '#080a0f',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '11px',
            color: '#4a5568',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            Publicité
          </span>
          <span style={{
            background: 'rgba(232,25,44,0.15)',
            border: '1px solid rgba(232,25,44,0.3)',
            color: '#e8192c',
            padding: '3px 10px',
            borderRadius: '20px',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '1px',
          }}>
            {adType === 'video_reward' ? '📺 VIDÉO REWARD' : '🔲 INTERSTITIELLE'}
          </span>
        </div>

        {adType === 'video_reward' ? (
          /* VIDEO AD */
          <div style={{ padding: '24px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1a0508, #0d0f18)',
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <span style={{ fontSize: '48px' }}>🎮</span>
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '13px',
                  color: '#4a5568',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  Regardez la pub pour miner
                </span>
              </div>
              {/* Progress bar */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0,
                height: '3px',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #e8192c, #ff3347)',
                boxShadow: '0 0 8px #e8192c',
                transition: 'width 0.1s linear',
              }} />
            </div>

            <button
              onClick={canClose ? onComplete : undefined}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: `1px solid ${canClose ? '#16a34a' : 'rgba(255,255,255,0.06)'}`,
                background: canClose
                  ? 'rgba(22,163,74,0.1)'
                  : 'transparent',
                color: canClose ? '#16a34a' : '#4a5568',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '3px',
                cursor: canClose ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
              }}
            >
              {canClose
                ? '✅ OBTENIR MA RÉCOMPENSE'
                : `⏳ ENCORE ${countdown}S...`}
            </button>
          </div>
        ) : (
          /* INTERSTITIAL AD */
          <div style={{
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#e8edf5',
              marginBottom: '8px',
              letterSpacing: '2px',
            }}>
              REBEL NETWORK
            </div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              color: '#4a5568',
              marginBottom: '32px',
              letterSpacing: '1px',
            }}>
              L'écosystème qui vous rémunère
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '42px',
                fontWeight: 900,
                color: '#e8192c',
                minWidth: '50px',
                textShadow: '0 0 20px rgba(232,25,44,0.4)',
              }}>
                {countdown > 0 ? countdown : '✓'}
              </div>
              <button
                onClick={canClose ? onComplete : undefined}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  border: `1px solid ${canClose
                    ? '#e8192c'
                    : 'rgba(255,255,255,0.06)'}`,
                  background: canClose
                    ? 'rgba(232,25,44,0.1)'
                    : 'transparent',
                  color: canClose ? '#e8192c' : '#4a5568',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: canClose ? 'pointer' : 'not-allowed',
                  letterSpacing: '1px',
                  transition: 'all 0.3s',
                }}
              >
                {canClose ? 'Fermer' : 'Attendre...'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}