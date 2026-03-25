interface ReferralPageProps {
  userId: string
}

export default function ReferralPage({ userId }: ReferralPageProps) {
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
          Invitez des amis — Gagnez du REBEL en automatique
        </div>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
      }}>
        {[
          { value: '0', label: 'Filleuls' },
          { value: '0.00000000', label: 'Gains Réf. (RBL)' },
          { value: '20%', label: 'Commission N1' },
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
              fontSize: '26px',
              fontWeight: 900,
              color: '#e8192c',
              marginBottom: '6px',
            }}>
              {s.value}
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
            value="rebelmine.app/ref/XXXXXXXX"
            style={{
              flex: 1,
              background: '#0d1018',
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
          <button style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid #e8192c',
            background: 'rgba(232,25,44,0.08)',
            color: '#e8192c',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '1px',
          }}>
            📋 Copier
          </button>
        </div>
      </div>

      {/* TIERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[
          { emoji: '🥉', name: 'Bronze', bonus: '+5%', req: '1–4 filleuls' },
          { emoji: '🥈', name: 'Argent', bonus: '+10%', req: '5–14 filleuls' },
          { emoji: '🥇', name: 'Or', bonus: '+15%', req: '15+ filleuls' },
        ].map((tier) => (
          <div key={tier.name} style={{
            background: '#12151e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{tier.emoji}</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '12px',
              color: '#4a5568',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}>
              {tier.name}
            </div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#c9a84c',
            }}>
              {tier.bonus}
            </div>
            <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '4px' }}>
              {tier.req}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}