'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface ReferralInfo {
  referralCode: string
  tier: string
  nextTier: string
  nextTierCount: number
  referralCount: number
  earnings: {
    n1: string
    n2: string
    n3: string
    total: string
  }
  referrals: {
    username: string
    earned: string
    joinedAt: string
    miningCount: number
  }[]
}

interface ReferralPageProps {
  userId: string
}

export default function ReferralPage({ userId }: ReferralPageProps) {
  const [info, setInfo] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralInfo()
  }, [])

  const fetchReferralInfo = async () => {
    try {
      const res = await fetch('/api/referral/info')
      const data = await res.json()
      setInfo(data)
    } catch (err) {
      console.error('Referral info error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    const link = `https://rebelmine.app/ref/${info?.referralCode}`
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tierColors: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#c9a84c',
  }

  const tierEmojis: Record<string, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#4a5568',
        fontFamily: 'Barlow Condensed, sans-serif',
        letterSpacing: '3px',
        fontSize: '13px',
        textTransform: 'uppercase',
      }}>
        Chargement...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>

      <div>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '36px',
          letterSpacing: '4px',
          color: '#e8edf5',
        }}>
          Tableau de Référence
        </div>
        <div style={{
          color: '#4a5568',
          fontSize: '14px',
          letterSpacing: '1px',
          fontFamily: 'Barlow Condensed, sans-serif',
        }}>
          Invitez des amis — Gagnez du REBEL automatiquement
        </div>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
      }}>
        {[
          { value: info?.referralCount || 0, label: 'Filleuls' },
          { value: info?.earnings.total || '0.00000000', label: 'Gains Réf. (RBL)' },
          {
            value: `${tierEmojis[info?.tier || 'bronze']} ${(info?.tier || 'bronze').toUpperCase()}`,
            label: 'Tier actuel',
            color: tierColors[info?.tier || 'bronze'],
          },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#12151e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #e8192c, transparent)',
            }} />
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '22px',
              fontWeight: 900,
              color: (s as any).color || '#e8192c',
              marginBottom: '6px',
            }}>
              {s.value.toString()}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#4a5568',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'Barlow Condensed, sans-serif',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* REFERRAL LINK */}
      <div style={{
        background: '#12151e',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <div style={{
          fontSize: '11px',
          color: '#4a5568',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '12px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 600,
        }}>
          Votre lien de parrainage
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            readOnly
            value={`rebelmine.app/ref/${info?.referralCode || '...'}`}
            style={{
              flex: 1,
              background: '#080a0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              color: '#e8192c',
              outline: 'none',
              letterSpacing: '1px',
            }}
          />
          <button
            onClick={copyLink}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: `1px solid ${copied ? '#16a34a' : '#e8192c'}`,
              background: copied
                ? 'rgba(22,163,74,0.08)'
                : 'rgba(232,25,44,0.08)',
              color: copied ? '#16a34a' : '#e8192c',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✅ Copié !' : '📋 Copier'}
          </button>
        </div>
      </div>

      {/* COMMISSIONS */}
      <div style={{
        background: '#12151e',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <div style={{
          fontSize: '11px',
          color: '#4a5568',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '16px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 600,
        }}>
          Gains par niveau
        </div>
        {[
          { level: 'N1', percent: '20%', earned: info?.earnings.n1 || '0.00000000', label: 'Filleuls directs' },
          { level: 'N2', percent: '10%', earned: info?.earnings.n2 || '0.00000000', label: 'Filleuls de filleuls' },
          { level: 'N3', percent: '5%', earned: info?.earnings.n3 || '0.00000000', label: '3ème niveau' },
        ].map((c) => (
          <div key={c.level} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(232,25,44,0.1)',
                border: '1px solid rgba(232,25,44,0.2)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '14px',
                color: '#e8192c',
                letterSpacing: '1px',
              }}>
                {c.level}
              </div>
              <div>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '14px',
                  color: '#e8edf5',
                  fontWeight: 600,
                }}>
                  {c.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4a5568',
                  letterSpacing: '1px',
                }}>
                  Commission {c.percent}
                </div>
              </div>
            </div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '15px',
              color: '#c9a84c',
              letterSpacing: '1px',
            }}>
              +{c.earned} RBL
            </div>
          </div>
        ))}
      </div>

      {/* TIERS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
      }}>
        {[
          { emoji: '🥉', name: 'Bronze', bonus: '+5%', req: '1–4 filleuls', tier: 'bronze' },
          { emoji: '🥈', name: 'Argent', bonus: '+10%', req: '5–14 filleuls', tier: 'silver' },
          { emoji: '🥇', name: 'Or', bonus: '+15%', req: '15+ filleuls', tier: 'gold' },
        ].map((t) => (
          <div key={t.name} style={{
            background: '#12151e',
            border: `1px solid ${info?.tier === t.tier
              ? tierColors[t.tier]
              : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{t.emoji}</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '12px',
              color: info?.tier === t.tier ? tierColors[t.tier] : '#4a5568',
              letterSpacing: '1px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              {t.name}
            </div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#c9a84c',
            }}>
              {t.bonus}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#4a5568',
              marginTop: '4px',
              fontFamily: 'Barlow Condensed, sans-serif',
            }}>
              {t.req}
            </div>
          </div>
        ))}
      </div>

      {/* REFERRALS TABLE */}
      {info && info.referrals.length > 0 && (
        <div style={{
          background: '#12151e',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            background: '#0d1018',
            padding: '16px 20px',
            fontSize: '11px',
            color: '#4a5568',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 600,
          }}>
            Mes filleuls ({info.referralCount})
          </div>
          {info.referrals.map((r, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < info.referrals.length - 1
                ? '1px solid rgba(255,255,255,0.03)'
                : 'none',
            }}>
              <div>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '15px',
                  color: '#e8edf5',
                  fontWeight: 600,
                }}>
                  {r.username}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4a5568',
                  marginTop: '2px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                }}>
                  {r.miningCount} minages · {formatDate(r.joinedAt)}
                </div>
              </div>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '14px',
                color: '#c9a84c',
                letterSpacing: '1px',
              }}>
                +{r.earned} RBL
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}