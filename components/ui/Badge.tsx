interface BadgeProps {
  children: React.ReactNode
  variant?: 'red' | 'blue' | 'silver' | 'gold'
}

export default function Badge({ children, variant = 'red' }: BadgeProps) {
  const colors = {
    red: { bg: 'rgba(232,25,44,0.12)', border: 'rgba(232,25,44,0.3)', color: '#ff3347' },
    blue: { bg: 'rgba(26,111,255,0.1)', border: 'rgba(26,111,255,0.25)', color: '#4d8fff' },
    silver: { bg: 'rgba(200,208,222,0.08)', border: 'rgba(200,208,222,0.2)', color: '#c8d0de' },
    gold: { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)', color: '#c9a84c' },
  }

  const c = colors[variant]

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '4px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontFamily: 'Barlow Condensed, sans-serif',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '2px',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}