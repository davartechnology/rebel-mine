'use client'

import { useState } from 'react'
import { calculateWithdrawal } from '@/lib/utils'

interface WithdrawModalProps {
  balance: string
  withdrawalCount: number
  onClose: () => void
  onSuccess: () => void
}

export default function WithdrawModal({
  balance,
  withdrawalCount,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'faucetpay' | 'usdt_trc20'>('faucetpay')
  const [paymentAddress, setPaymentAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const getMinimum = () => {
    if (withdrawalCount === 0) return 10
    if (withdrawalCount === 1) return 30
    if (withdrawalCount === 2) return 75
    return 250
  }

  const minimum = getMinimum()
  const amountNum = parseFloat(amount) || 0
  const calc = amountNum > 0 ? calculateWithdrawal(amountNum) : null
  const amountUsd = calc ? (calc.net * 0.002).toFixed(4) : '0'
  const isUsdtEligible = calc ? parseFloat(amountUsd) >= 2.0 : false

  const handleSubmit = async () => {
    setError('')

    if (!amount || amountNum <= 0) {
      setError('Entrez un montant valide')
      return
    }

    if (amountNum < minimum) {
      setError(`Minimum requis : ${minimum} REBEL`)
      return
    }

    if (amountNum > parseFloat(balance)) {
      setError('Solde insuffisant')
      return
    }

    if (!paymentAddress.trim()) {
      setError('Entrez votre adresse de paiement')
      return
    }

    if (paymentMethod === 'usdt_trc20' && !isUsdtEligible) {
      setError('Minimum 2$ requis pour USDT TRC20')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod,
          paymentAddress: paymentAddress.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors du retrait')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.88)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      padding: '20px',
    }}>
      <div style={{
        background: '#0d1018',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
      }}>

        {/* HEADER */}
        <div style={{
          background: '#080a0f',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '20px',
            letterSpacing: '3px',
            color: '#e8edf5',
          }}>
            RETRAIT REBEL
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4a5568',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>

          {success ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '22px',
                letterSpacing: '3px',
                color: '#16a34a',
                marginBottom: '8px',
              }}>
                RETRAIT SOUMIS
              </div>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '14px',
                color: '#4a5568',
                letterSpacing: '1px',
              }}>
                Traitement sous 24 à 72 heures
              </div>
            </div>
          ) : (
            <>
              {/* SOLDE DISPONIBLE */}
              <div style={{
                background: '#12151e',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '12px',
                  color: '#4a5568',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  Solde disponible
                </span>
                <span style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '18px',
                  color: '#e8192c',
                  letterSpacing: '1px',
                }}>
                  {balance} RBL
                </span>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(232,25,44,0.1)',
                  border: '1px solid rgba(232,25,44,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  color: '#ff3347',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '14px',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* MONTANT */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#4a5568',
                  marginBottom: '8px',
                }}>
                  Montant (min. {minimum} REBEL)
                </label>
                <input
                  type="number"
                  placeholder={`${minimum}.00000000`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minimum}
                  max={parseFloat(balance)}
                  step="0.00000001"
                  style={{
                    width: '100%',
                    background: '#080a0f',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '16px',
                    color: '#e8edf5',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#e8192c'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

              {/* MODE DE PAIEMENT */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#4a5568',
                  marginBottom: '8px',
                }}>
                  Mode de paiement
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'faucetpay', label: '💧 FaucetPay', sub: '< 2$' },
                    { id: 'usdt_trc20', label: '💵 USDT TRC20', sub: '≥ 2$' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: `1px solid ${paymentMethod === method.id
                          ? '#e8192c'
                          : 'rgba(255,255,255,0.06)'}`,
                        background: paymentMethod === method.id
                          ? 'rgba(232,25,44,0.08)'
                          : 'transparent',
                        color: paymentMethod === method.id
                          ? '#e8192c'
                          : '#4a5568',
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div>{method.label}</div>
                      <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.7 }}>
                        {method.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ADRESSE */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#4a5568',
                  marginBottom: '8px',
                }}>
                  {paymentMethod === 'faucetpay'
                    ? 'Email FaucetPay'
                    : 'Adresse Wallet TRC20'}
                </label>
                <input
                  type="text"
                  placeholder={paymentMethod === 'faucetpay'
                    ? 'votre@email.com'
                    : 'TXxx...'}
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#080a0f',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '14px',
                    color: '#e8edf5',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#e8192c'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

              {/* RÉCAPITULATIF */}
              {calc && (
                <div style={{
                  background: '#12151e',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '11px',
                    color: '#4a5568',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    fontWeight: 600,
                  }}>
                    Récapitulatif
                  </div>
                  {[
                    { label: 'Montant demandé', value: `${calc.requested.toFixed(8)} RBL`, color: '#e8edf5' },
                    { label: 'Réserve token (10%)', value: `- ${calc.reserve.toFixed(8)} RBL`, color: '#e8192c' },
                    { label: 'Frais transaction (3%)', value: `- ${calc.fee.toFixed(8)} RBL`, color: '#e8192c' },
                    { label: 'Vous recevez (87%)', value: `${calc.net.toFixed(8)} RBL`, color: '#16a34a' },
                    { label: 'Valeur estimée', value: `≈ ${amountUsd}$`, color: '#c9a84c' },
                  ].map((row) => (
                    <div key={row.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                      <span style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '13px',
                        color: '#4a5568',
                        letterSpacing: '0.5px',
                      }}>
                        {row.label}
                      </span>
                      <span style={{
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: '14px',
                        color: row.color,
                        letterSpacing: '1px',
                      }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* RESERVE NOTICE */}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(26,111,255,0.06)',
                border: '1px solid rgba(26,111,255,0.12)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '12px',
                color: '#4a5568',
                lineHeight: '1.6',
              }}>
                ℹ️ La réserve de 10% sera transférée sur votre wallet
                au lancement officiel du token REBEL sur la blockchain.
              </div>

              {/* SUBMIT */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: loading
                    ? 'rgba(232,25,44,0.4)'
                    : 'linear-gradient(135deg, #e8192c, #cc1526)',
                  color: '#ffffff',
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '16px',
                  letterSpacing: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(232,25,44,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'TRAITEMENT...' : 'SOUMETTRE LE RETRAIT'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}