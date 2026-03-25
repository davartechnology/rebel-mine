interface MinePageProps {
  userId: string
  onBalanceUpdate: () => void
}

export default function MinePage({ userId, onBalanceUpdate }: MinePageProps) {
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
          color: '#e8192c',
          lineHeight: 1,
          textShadow: '0 0 30px rgba(232,25,44,0.4)',
          letterSpacing: '2px',
        }}>
          0.00000000
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '14px',
          color: '#4a5568',
          marginTop: '6px',
          letterSpacing: '3px',
        }}>
          REBEL
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
          <span>0.00000000 / 10 RBL</span>
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
            width: '0%',
            background: 'linear-gradient(90deg, #e8192c, #ff3347)',
            borderRadius: '4px',
            boxShadow: '0 0 10px #e8192c',
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
          animation: 'spin 8s linear infinite',
        }} />

        {/* Main button */}
        <button style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: '2px solid #e8192c',
          cursor: 'pointer',
          background: 'radial-gradient(circle at 35% 35%, #2a0508, #080a0f)',
          boxShadow: '0 0 0 6px rgba(232,25,44,0.05), 0 0 40px rgba(232,25,44,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.15s',
        }}>
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
        </button>
      </div>

      {/* STATS ROW */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {[
          { value: '0', label: 'Total minages' },
          { value: '0.00000000', label: "Aujourd'hui (RBL)" },
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
      <button style={{
        width: '100%',
        padding: '16px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent',
        color: '#4a5568',
        cursor: 'not-allowed',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
      }}>
        🔒 RETRAIT — MIN. 10 REBEL
      </button>

    </div>
  )
}