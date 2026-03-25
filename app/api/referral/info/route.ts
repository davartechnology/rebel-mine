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

    const userId = session.user.id

    // Infos user
    const user = await query(
      'SELECT referral_code, tier FROM users WHERE id = $1',
      [userId]
    )

    if (user.rows.length === 0) {
      return NextResponse.json({ error: 'User non trouvé' }, { status: 404 })
    }

    // Nombre de filleuls
    const refCount = await query(
      'SELECT COUNT(*) FROM referrals WHERE referrer_id = $1',
      [userId]
    )

    // Gains totaux de parrainage
    const earnings = await query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'referral_n1' THEN amount ELSE 0 END), 0) as n1,
        COALESCE(SUM(CASE WHEN type = 'referral_n2' THEN amount ELSE 0 END), 0) as n2,
        COALESCE(SUM(CASE WHEN type = 'referral_n3' THEN amount ELSE 0 END), 0) as n3,
        COALESCE(SUM(CASE WHEN type IN ('referral_n1','referral_n2','referral_n3') THEN amount ELSE 0 END), 0) as total
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    )

    // Liste des filleuls
    const referrals = await query(
      `SELECT u.username, r.total_earned, r.created_at,
              b.total_mining_count
       FROM referrals r
       JOIN users u ON u.id = r.referred_id
       LEFT JOIN balances b ON b.user_id = r.referred_id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [userId]
    )

    const e = earnings.rows[0]
    const count = parseInt(refCount.rows[0].count)

    // Calculer le tier
    let tier = 'bronze'
    let nextTier = 'silver'
    let nextTierCount = 5
    if (count >= 15) { tier = 'gold'; nextTier = 'max'; nextTierCount = 0 }
    else if (count >= 5) { tier = 'silver'; nextTier = 'gold'; nextTierCount = 15 }

    return NextResponse.json({
      referralCode: user.rows[0].referral_code,
      tier,
      nextTier,
      nextTierCount,
      referralCount: count,
      earnings: {
        n1: parseFloat(e.n1).toFixed(8),
        n2: parseFloat(e.n2).toFixed(8),
        n3: parseFloat(e.n3).toFixed(8),
        total: parseFloat(e.total).toFixed(8),
      },
      referrals: referrals.rows.map((r: any) => ({
        username: r.username
          ? r.username.substring(0, 4) + '****'
          : 'User****',
        earned: parseFloat(r.total_earned).toFixed(8),
        joinedAt: r.created_at,
        miningCount: r.total_mining_count || 0,
      })),
    })

  } catch (error) {
    console.error('Referral info error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}