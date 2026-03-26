'use client'

interface NavbarProps {
  activePage: 'mine' | 'referral' | 'history'
  onPageChange: (page: 'mine' | 'referral' | 'history') => void
  balance: string
}

export default function Navbar({
  activePage,
  onPageChange,
  balance,
}: NavbarProps) {
  return (
    <>
      {/* TOP BAR */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(8,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '56px',
      }}>
        {/* LOGO */}
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '20px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #e8192c, #ff3347)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '4px',
        }}>
          REBELONE
        </div>

        {/* BALANCE PILL */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#12151e',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '30px',
          padding: '6px 14px',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '13px',
          letterSpacing: '1px',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#e8192c',
            boxShadow: '0 0 6px #e8192c',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ color: '#e8edf5' }}>{balance}</span>
          <span style={{ color: '#4a5568', fontSize: '10px' }}>RBL</span>
        </div>
      </nav>

      {/* BOTTOM NAV — Style mobile app */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(8,10,15,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {[
          { id: 'mine', icon: '⛏️', label: 'Mine' },
          { id: 'referral', icon: '👥', label: 'Référence' },
          { id: 'history', icon: '📋', label: 'Historique' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id as any)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 20px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              flex: 1,
            }}
          >
            <span style={{
              fontSize: '22px',
              filter: activePage === tab.id
                ? 'none'
                : 'grayscale(1) opacity(0.4)',
              transition: 'filter 0.2s',
            }}>
              {tab.icon}
            </span>
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: activePage === tab.id ? '#e8192c' : '#4a5568',
              transition: 'color 0.2s',
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}