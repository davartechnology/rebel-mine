interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function Card({ children, style }: CardProps) {
  return (
    <div style={{
      background: '#12151e',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}