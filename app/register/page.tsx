'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          referralCode: form.referralCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'inscription')
        return
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '42px',
            letterSpacing: '8px',
            background: 'linear-gradient(135deg, #e8192c, #ff3347)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SHEE MINE
          </div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '13px',
            letterSpacing: '4px',
            color: '#4a5568',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            Créer votre compte
          </div>
        </div>

        {/* BONUS BADGE */}
        <div style={{
          background: 'rgba(232,25,44,0.08)',
          border: '1px solid rgba(232,25,44,0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '24px',
          textAlign: 'center',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '14px',
          color: '#e8192c',
          letterSpacing: '1px',
        }}>
          🎁 Bonus inscription : <strong>+0.50 SHEE offerts</strong>
        </div>

        {/* FORM CARD */}
        <div style={{
          background: '#0d1018',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '32px',
        }}>

          {error && (
            <div style={{
              background: 'rgba(232,25,44,0.1)',
              border: '1px solid rgba(232,25,44,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#ff3347',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              letterSpacing: '0.5px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key: 'username', label: 'Nom d\'utilisateur', type: 'text', placeholder: 'shee_user' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'vous@email.com' },
              { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
              { key: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', placeholder: '••••••••' },
              { key: 'referralCode', label: 'Code de parrainage (optionnel)', type: 'text', placeholder: 'XXXXXXXX' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
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
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  required={field.key !== 'referralCode'}
                  style={{
                    width: '100%',
                    background: '#080a0f',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '15px',
                    color: '#e8edf5',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#e8192c'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '8px',
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
              {loading ? 'CRÉATION...' : 'CRÉER MON COMPTE'}
            </button>
          </form>
        </div>

        {/* LOGIN LINK */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '14px',
          color: '#4a5568',
          letterSpacing: '1px',
        }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{
            color: '#e8192c',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Se connecter
          </Link>
        </div>

        {/* TOKEN NOTICE */}
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: 'rgba(26,111,255,0.06)',
          border: '1px solid rgba(26,111,255,0.15)',
          borderRadius: '10px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '12px',
          color: '#4a5568',
          letterSpacing: '0.5px',
          lineHeight: '1.6',
          textAlign: 'center',
        }}>
          ℹ️ Le token SHEE n'est pas encore lancé sur la blockchain.
          Prix actuel fixé à <strong style={{ color: '#e8192c' }}>0.002$</strong> par SHEE.
          Les retraits sont traités via FaucetPay et USDT TRC20.
        </div>

      </div>
    </div>
  )
}