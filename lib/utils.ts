export function formatBalance(amount: number): string {
  return amount.toFixed(8)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return `Il y a ${diff}s`
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 172800) return 'Hier'
  return d.toLocaleDateString('fr-FR')
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function calculateWithdrawal(amount: number) {
  const reservePercent = 0.10
  const feePercent = 0.03
  const reserve = amount * reservePercent
  const fee = amount * feePercent
  const net = amount - reserve - fee
  return {
    requested: amount,
    reserve: parseFloat(reserve.toFixed(8)),
    fee: parseFloat(fee.toFixed(8)),
    net: parseFloat(net.toFixed(8)),
    netUsd: parseFloat((net * 0.002).toFixed(6)),
  }
}