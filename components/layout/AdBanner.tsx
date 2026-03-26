'use client'

interface AdBannerProps {
  hidden?: boolean
}

export default function AdBanner({ hidden = false }: AdBannerProps) {
  if (hidden) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '64px',
      left: 0,
      right: 0,
      zIndex: 90,
      height: '60px',
      background: 'rgba(8,10,15,0.95)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Placeholder pub — sera remplacé par AdSense au déploiement */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        height: '50px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.04)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '11px',
          color: '#4a5568',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          Publicité
        </span>
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '11px',
          color: 'rgba(232,25,44,0.3)',
          letterSpacing: '1px',
        }}>
          · AdSense
        </span>
      </div>
    </div>
  )
}