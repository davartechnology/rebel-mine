'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Transaction {
  id: string
  type: string
  amount: string
  description: string
  status: string
  createdAt: string
}

interface HistoryPageProps {
  userId: string
}

export default function HistoryPage({ userId }: HistoryPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [filter, page])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/wallet/transactions?type=${filter}&page=${page}`
      )
      const data = await res.json()
      if (page === 1) {
        setTransactions(data.transactions || [])
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])])
      }
      setHasMore(data.hasMore || false)
    } catch (err) {
      console.error('Transactions error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (newFilter: string) => {
    setFilter(newFilter)
    setPage(1)
  }

  const getIcon = (type: string) => {
    if (type === 'mine' || type === 'bonus') return '⛏️'
    if (type.startsWith('referral')) return '👥'
    if (type === 'withdrawal') return '💸'
    return '💰'
  }

  const getIconBg = (type: string) => {
    if (type === 'mine' || type === 'bonus')
      return 'rgba(232,25,44,0.1)'
    if (type.startsWith('referral'))
      return 'rgba(201,168,76,0.1)'
    if (type === 'withdrawal')
      return 'rgba(255,59,59,0.1)'
    return 'rgba(26,111,255,0.1)'
  }

  const isPositive = (type: string) => type !== 'withdrawal'

  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'mine', label: '⛏ Minage' },
    { id: 'referral', label: '👥 Référence' },
    { id: 'withdrawal', label: '💸 Retrait' },
  ]

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
          Historique
        </div>
        <div style={{
          color: '#4a5568',
          fontSize: '14px',
          letterSpacing: '1px',
          fontFamily: 'Barlow Condensed, sans-serif',
        }}>
          Toutes vos activités SHEE
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFilter(f.id)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: `1px solid ${filter === f.id
                ? '#e8192c'
                : 'rgba(255,255,255,0.06)'}`,
              background: filter === f.id
                ? 'rgba(232,25,44,0.1)'
                : 'transparent',
              color: filter === f.id ? '#e8192c' : '#4a5568',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* TRANSACTIONS LIST */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {loading && page === 1 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#4a5568',
            fontFamily: 'Barlow Condensed, sans-serif',
            letterSpacing: '2px',
            fontSize: '13px',
            textTransform: 'uppercase',
          }}>
            Chargement...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#4a5568',
            fontFamily: 'Barlow Condensed, sans-serif',
            letterSpacing: '2px',
            fontSize: '13px',
            textTransform: 'uppercase',
          }}>
            Aucune activité pour le moment
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} style={{
              background: '#12151e',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: getIconBg(t.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}>
                {getIcon(t.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#e8edf5',
                  marginBottom: '3px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  letterSpacing: '0.5px',
                }}>
                  {t.description}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4a5568',
                  letterSpacing: '1px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                }}>
                  {formatDate(t.createdAt)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: isPositive(t.type) ? '#e8192c' : '#ff3b3b',
                  letterSpacing: '1px',
                }}>
                  {isPositive(t.type) ? '+' : '-'}{t.amount}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#4a5568',
                  letterSpacing: '1px',
                  marginTop: '2px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                }}>
                  SHEE
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'transparent',
            color: '#4a5568',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '13px',
            letterSpacing: '2px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Charger plus
        </button>
      )}

    </div>
  )
}