import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const result = await query(
      `SELECT u.id, u.username, u.email, u.referral_code,
              u.tier, u.is_verified, u.created_at, u.withdrawal_count,
              b.frz_balance, b.reserved_balance, b.total_mined,
              b.total_withdrawn, b.today_earned, b.total_mining_count
       FROM users u
       LEFT JOIN balances b ON b.user_id = u.id
       WHERE u.id = $1`,
      [session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User non trouvé' }, { status: 404 })
    }

    const u = result.rows[0]

    return NextResponse.json({
      id: u.id,
      username: u.username,
      email: u.email,
      referralCode: u.referral_code,
      tier: u.tier,
      isVerified: u.is_verified,
      createdAt: u.created_at,
      withdrawalCount: u.withdrawal_count,
      balance: {
        frz: parseFloat(u.frz_balance || 0).toFixed(8),
        reserved: parseFloat(u.reserved_balance || 0).toFixed(8),
        totalMined: parseFloat(u.total_mined || 0).toFixed(8),
        totalWithdrawn: parseFloat(u.total_withdrawn || 0).toFixed(8),
        todayEarned: parseFloat(u.today_earned || 0).toFixed(8),
        totalMiningCount: u.total_mining_count || 0,
      },
    })

  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}