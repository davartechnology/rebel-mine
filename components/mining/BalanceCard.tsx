'use client'

interface BalanceCardProps {
  balance: string
  animating: boolean
  animatedBalance: string
}

export default function BalanceCard({
  balance,
  animating,
  animatedBalance,
}: BalanceCardProps) {
  return (
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
        position: 'absolute',
        top: '-50%', left: '-50%',
        width: '200%', height: '200%',
        background: 'radial-gradient(circle at center, rgba(232,25,44,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        fontSize: '11px',
        letterSpacing: '3px',
        color: '#4a5568',
        textTransform: 'uppercase',
        marginBottom: '8px',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 600,
        position: 'relative',
        zIndex: 1,
      }}>
        Solde actuel
      </div>
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '32px',
        fontWeight: 900,
        color: '#e8192c',
        lineHeight: 1,
        textShadow: animating
          ? '0 0 40px rgba(232,25,44,0.6)'
          : '0 0 20px rgba(232,25,44,0.3)',
        letterSpacing: '2px',
        transition: 'text-shadow 0.3s',
        position: 'relative',
        zIndex: 1,
      }}>
        {animating ? animatedBalance : balance}
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: '14px',
        color: '#4a5568',
        marginTop: '6px',
        letterSpacing: '3px',
        position: 'relative',
        zIndex: 1,
      }}>
        REBEL
      </div>
    </div>
  )
}