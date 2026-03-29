import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const [users, mined, withdrawn, pending, todayMinings] = await Promise.all([
      query('SELECT COUNT(*) as total FROM users'),
      query('SELECT COALESCE(SUM(frz_balance),0) as total FROM balances'),
      query('SELECT COALESCE(SUM(total_withdrawn),0) as total FROM balances'),
      query('SELECT COUNT(*) as total FROM withdrawals WHERE status = $1', ['pending']),
      query(`SELECT COUNT(*) as total FROM mining_sessions
             WHERE status = 'completed'
             AND completed_at > NOW() - INTERVAL '24 hours'`),
    ])

    const activeUsers = await query(
      `SELECT COUNT(DISTINCT user_id) as total
       FROM mining_sessions
       WHERE completed_at > NOW() - INTERVAL '7 days'`
    )

    return NextResponse.json({
      totalUsers: parseInt(users.rows[0].total),
      activeUsers: parseInt(activeUsers.rows[0].total),
      totalMined: parseFloat(mined.rows[0].total).toFixed(8),
      totalWithdrawn: parseFloat(withdrawn.rows[0].total).toFixed(8),
      pendingWithdrawals: parseInt(pending.rows[0].total),
      todayMinings: parseInt(todayMinings.rows[0].total),
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}