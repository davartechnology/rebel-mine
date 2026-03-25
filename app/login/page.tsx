'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Compte créé avec succès ! Connectez-vous.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/' })
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
      <div style={{ width: '100%', maxWidth: '420px' }}>

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
            REBEL MINE
          </div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '13px',
            letterSpacing: '4px',
            color: '#4a5568',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            Connexion à votre compte
          </div>
        </div>

        {/* FORM CARD */}
        <div style={{
          background: '#0d1018',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '32px',
        }}>

          {success && (
            <div style={{
              background: 'rgba(22,163,74,0.1)',
              border: '1px solid rgba(22,163,74,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#16a34a',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              letterSpacing: '0.5px',
            }}>
              ✅ {success}
            </div>
          )}

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
              { key: 'email', label: 'Email', type: 'email', placeholder: 'vous@email.com' },
              { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
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
                  required
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
              {loading ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
          </form>

          {/* DIVIDER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '12px',
              color: '#4a5568',
              letterSpacing: '2px',
            }}>
              OU
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* GOOGLE */}
          <button
            onClick={handleGoogle}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: '#e8edf5',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '18px' }}>G</span>
            CONTINUER AVEC GOOGLE
          </button>

        </div>

        {/* REGISTER LINK */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '14px',
          color: '#4a5568',
          letterSpacing: '1px',
        }}>
          Pas encore de compte ?{' '}
          <Link href="/register" style={{
            color: '#e8192c',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            S'inscrire gratuitement
          </Link>
        </div>

        {/* BONUS REMINDER */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(232,25,44,0.06)',
          border: '1px solid rgba(232,25,44,0.12)',
          borderRadius: '10px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '12px',
          color: '#4a5568',
          letterSpacing: '0.5px',
          textAlign: 'center',
        }}>
          🎁 Nouveau ? Inscrivez-vous et recevez{' '}
          <strong style={{ color: '#e8192c' }}>+0.50 REBEL</strong> offerts
        </div>

      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: '14px',
        color: '#4a5568',
        letterSpacing: '3px',
        textTransform: 'uppercase',
      }}>
        Chargement...
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  )
}