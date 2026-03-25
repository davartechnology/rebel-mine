interface HistoryPageProps {
  userId: string
}

export default function HistoryPage({ userId }: HistoryPageProps) {
  const demoItems = [
    { type: 'mine', action: 'Minage effectué', time: 'Il y a 2 min', amount: '+1.00000000', positive: true },
    { type: 'ref', action: 'Bonus parrainage', time: 'Il y a 1h', amount: '+0.20000000', positive: true },
    { type: 'out', action: 'Retrait effectué', time: 'Hier', amount: '-8.73000000', positive: false },
  ]

  const icons: Record<string, string> = {
    mine: '⛏️', ref: '👥', out: '💸'
  }

  const iconBg: Record<string, string> = {
    mine: 'rgba(232,25,44,0.1)',
    ref: 'rgba(201,168,76,0.1)',
    out: 'rgba(255,59,59,0.1)',
  }

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
          Historique
        </div>
        <div style={{
          color: '#4a5568',
          fontSize: '14px',
          letterSpacing: '1px',
          fontFamily: 'Barlow Condensed, sans-serif',
        }}>
          Toutes vos activités REBEL
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['Tout', '⛏ Minage', '👥 Référence', '💸 Retrait'].map((f, i) => (
          <button key={f} style={{
            padding: '7px 16px',
            borderRadius: '20px',
            border: `1px solid ${i === 0 ? '#e8192c' : 'rgba(255,255,255,0.06)'}`,
            background: i === 0 ? 'rgba(232,25,44,0.1)' : 'transparent',
            color: i === 0 ? '#e8192c' : '#4a5568',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {demoItems.map((item, i) => (
          <div key={i} style={{
            background: '#12151e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: iconBg[item.type],
              border: `1px solid ${iconBg[item.type]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              {icons[item.type]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#e8edf5',
                marginBottom: '3px',
                fontFamily: 'Barlow Condensed, sans-serif',
                letterSpacing: '0.5px',
              }}>
                {item.action}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#4a5568',
                letterSpacing: '1px',
                fontFamily: 'Barlow Condensed, sans-serif',
              }}>
                {item.time}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                color: item.positive ? '#e8192c' : '#ff3b3b',
                letterSpacing: '1px',
              }}>
                {item.amount}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#4a5568',
                letterSpacing: '1px',
                marginTop: '2px',
                fontFamily: 'Barlow Condensed, sans-serif',
              }}>
                REBEL
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}