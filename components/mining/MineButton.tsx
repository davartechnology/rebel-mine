'use client'

interface MineButtonProps {
  status: 'idle' | 'mining' | 'cooldown'
  cooldownSeconds: number
  onClick: () => void
}

export default function MineButton({
  status,
  cooldownSeconds,
  onClick,
}: MineButtonProps) {
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isDisabled = status !== 'idle'

  const getBorderColor = () => {
    if (status === 'mining') return '#16a34a'
    if (status === 'cooldown') return '#4a5568'
    return '#e8192c'
  }

  const getBoxShadow = () => {
    if (status === 'mining')
      return '0 0 0 8px rgba(22,163,74,0.1), 0 0 60px rgba(22,163,74,0.3)'
    if (status === 'cooldown')
      return 'none'
    return '0 0 0 6px rgba(232,25,44,0.05), 0 0 40px rgba(232,25,44,0.2)'
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      // MIINER/MIINAGE branding
      justifyContent: 'center',
      height: '220px',
      width: '220px',
    }}>
      {/* Orbit ring */}
      {status !== 'cooldown' && (
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: `1px dashed ${status === 'mining'
            ? 'rgba(22,163,74,0.3)'
            : 'rgba(232,25,44,0.2)'}`,
          animation: 'orbit 8s linear infinite',
        }} />
      )}

      {/* Main button */}
      <button
        onClick={isDisabled ? undefined : onClick}
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: `2px solid ${getBorderColor()}`,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          background: status === 'mining'
            ? 'radial-gradient(circle at 35% 35%, #0a2010, #080a0f)'
            : status === 'cooldown'
            ? 'radial-gradient(circle at 35% 35%, #1a1a2e, #080a0f)'
            : 'radial-gradient(circle at 35% 35%, #2a0508, #080a0f)',
          boxShadow: getBoxShadow(),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.15s',
          opacity: status === 'cooldown' ? 0.6 : 1,
          animation: status === 'mining'
            ? 'miningPulse 0.5s ease infinite alternate'
            : 'none',
        }}
      >
        <span style={{ fontSize: '36px' }}>
          {status === 'mining' ? '⚡' : status === 'cooldown' ? '⏳' : '⛏️'}
        </span>
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: status === 'mining'
            ? '#16a34a'
            : status === 'cooldown'
            ? '#4a5568'
            : '#e8192c',
        }}>
          {status === 'mining'
            ? 'MIINAGE...'
            : status === 'cooldown'
            ? formatCooldown(cooldownSeconds)
            : 'MIINER'}
        </span>
      </button>
    </div>
  )
}