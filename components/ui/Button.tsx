interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'locked'
  fullWidth?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #e8192c, #cc1526)',
      border: 'none',
      color: '#ffffff',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(232,25,44,0.35)',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid rgba(200,208,222,0.25)',
      color: '#e8edf5',
      cursor: 'pointer',
      boxShadow: 'none',
    },
    locked: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#4a5568',
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
  }

  const v = variants[variant]

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: '14px 28px',
        borderRadius: '10px',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: '14px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        ...v,
        ...style,
      }}
    >
      {children}
    </button>
  )
}