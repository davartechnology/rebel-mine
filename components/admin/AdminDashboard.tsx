'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalMined: string
  totalWithdrawn: string
  pendingWithdrawals: number
  todayMinings: number
}

interface Withdrawal {
  id: string
  username: string
  requested: string
  sent: string
  paymentMethod: string
  paymentAddress: string
  status: string
  withdrawalNumber: number
  requestedAt: string
}

interface Config {
  key: string
  value: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [config, setConfig] = useState<Config[]>([])
  const [activeTab, setActiveTab] = useState<'stats' | 'withdrawals' | 'config'>('stats')
  const [loading, setLoading] = useState(true)
  const [editConfig, setEditConfig] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, withdrawalsRes, configRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/config'),
      ])
      const [statsData, withdrawalsData, configData] = await Promise.all([
        statsRes.json(),
        withdrawalsRes.json(),
        configRes.json(),
      ])
      setStats(statsData)
      setWithdrawals(withdrawalsData.withdrawals || [])
      setConfig(configData.config || [])
      const configMap: Record<string, string> = {}
      configData.config?.forEach((c: Config) => {
        configMap[c.key] = c.value
      })
      setEditConfig(configMap)
    } catch (err) {
      console.error('Admin fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateWithdrawal = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      fetchAll()
    } catch (err) {
      console.error('Update withdrawal error:', err)
    }
  }

  const saveConfig = async () => {
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: editConfig }),
      })
      alert('Configuration sauvegardée !')
      fetchAll()
    } catch (err) {
      console.error('Save config error:', err)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'completed') return '#16a34a'
    if (status === 'pending') return '#e8192c'
    if (status === 'processing') return '#c9a84c'
    return '#4a5568'
  }

  const statusLabel = (status: string) => {
    if (status === 'completed') return '✅ Payé'
    if (status === 'pending') return '⏳ En attente'
    if (status === 'processing') return '🔄 En cours'
    if (status === 'rejected') return '❌ Rejeté'
    return status
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '80px 20px 100px',
      minHeight: '100vh',
    }}>

      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '42px',
          letterSpacing: '6px',
          background: 'linear-gradient(135deg, #e8192c, #ff3347)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ADMIN DASHBOARD
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '13px',
          color: '#4a5568',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          SHEE MINE · Panneau de contrôle
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: '#0d1018',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '24px',
      }}>
        {[
          { id: 'stats', label: '📊 Statistiques' },
          { id: 'withdrawals', label: '💸 Retraits' },
          { id: 'config', label: '⚙️ Configuration' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #e8192c, #cc1526)'
                : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#4a5568',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#4a5568',
          fontFamily: 'Barlow Condensed, sans-serif',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          Chargement...
        </div>
      ) : (
        <>
          {/* STATS TAB */}
          {activeTab === 'stats' && stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
            }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Users Actifs', value: stats.activeUsers, icon: '⚡' },
                { label: 'Total Miné', value: `${stats.totalMined} SHEE`, icon: '⛏️' },
                { label: 'Total Retiré', value: `${stats.totalWithdrawn} SHEE`, icon: '💸' },
                { label: 'Retraits En Attente', value: stats.pendingWithdrawals, icon: '⏳' },
                { label: 'Minages Aujourd\'hui', value: stats.todayMinings, icon: '📈' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: '#12151e',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <span style={{ fontSize: '28px' }}>{s.icon}</span>
                  <div>
                    <div style={{
                      fontFamily: 'Bebas Neue, sans-serif',
                      fontSize: '24px',
                      color: '#e8192c',
                      letterSpacing: '1px',
                    }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: '11px',
                      color: '#4a5568',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === 'withdrawals' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {withdrawals.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#4a5568',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  Aucun retrait en attente
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} style={{
                    background: '#12151e',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}>
                      <div>
                        <div style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#e8edf5',
                          marginBottom: '4px',
                        }}>
                          {w.username} · Retrait #{w.withdrawalNumber}
                        </div>
                        <div style={{
                          fontFamily: 'Bebas Neue, sans-serif',
                          fontSize: '20px',
                          color: '#e8192c',
                          letterSpacing: '1px',
                        }}>
                          {w.sent} SHEE
                        </div>
                        <div style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: '12px',
                          color: '#4a5568',
                          marginTop: '4px',
                        }}>
                          {w.paymentMethod === 'faucetpay' ? '💧 FaucetPay' : '💵 USDT TRC20'}
                          {' · '}{w.paymentAddress}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: statusColor(w.status),
                        letterSpacing: '1px',
                      }}>
                        {statusLabel(w.status)}
                      </div>
                    </div>

                    {w.status === 'pending' && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px',
                      }}>
                        <button
                          onClick={() => updateWithdrawal(w.id, 'processing')}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #c9a84c',
                            background: 'rgba(201,168,76,0.08)',
                            color: '#c9a84c',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            cursor: 'pointer',
                          }}
                        >
                          🔄 En cours
                        </button>
                        <button
                          onClick={() => updateWithdrawal(w.id, 'completed')}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #16a34a',
                            background: 'rgba(22,163,74,0.08)',
                            color: '#16a34a',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            cursor: 'pointer',
                          }}
                        >
                          ✅ Payé
                        </button>
                        <button
                          onClick={() => updateWithdrawal(w.id, 'rejected')}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(232,25,44,0.3)',
                            background: 'rgba(232,25,44,0.06)',
                            color: '#e8192c',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            cursor: 'pointer',
                          }}
                        >
                          ❌ Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === 'config' && (
            <div style={{
              background: '#12151e',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '24px',
              }}>
                {config.map((c) => (
                  <div key={c.key}>
                    <label style={{
                      display: 'block',
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#4a5568',
                      marginBottom: '6px',
                    }}>
                      {c.key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="text"
                      value={editConfig[c.key] || ''}
                      onChange={(e) => setEditConfig({
                        ...editConfig,
                        [c.key]: e.target.value,
                      })}
                      style={{
                        width: '100%',
                        background: '#080a0f',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '15px',
                        color: '#e8192c',
                        outline: 'none',
                        letterSpacing: '1px',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e8192c'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={saveConfig}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e8192c, #cc1526)',
                  color: '#ffffff',
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '16px',
                  letterSpacing: '3px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(232,25,44,0.3)',
                }}
              >
                💾 SAUVEGARDER LA CONFIG
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}