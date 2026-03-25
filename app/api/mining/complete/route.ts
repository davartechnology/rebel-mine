import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { sessionId } = await req.json()
    const userId = session.user.id

    // Vérifier la session
    const miningSession = await query(
      `SELECT * FROM mining_sessions
       WHERE id = $1 AND user_id = $2 AND status = 'mining' AND ad_verified = true`,
      [sessionId, userId]
    )

    if (miningSession.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 400 }
      )
    }

    const ms = miningSession.rows[0]

    // Vérifier que 5 minutes se sont écoulées côté serveur
    const startedAt = new Date(ms.started_at)
    const now = new Date()
    const elapsedSeconds = (now.getTime() - startedAt.getTime()) / 1000

    // On accepte à partir de 290 secondes (5min - 10s de tolérance)
    if (elapsedSeconds < 290) {
      return NextResponse.json(
        { error: `Minage incomplet. Encore ${Math.ceil(290 - elapsedSeconds)} secondes.` },
        { status: 400 }
      )
    }

    // Récupérer la config
    const config = await query(
      `SELECT key, value FROM app_config
       WHERE key IN ('mining_reward', 'mining_cooldown_minutes')`
    )
    const configMap: Record<string, string> = {}
    config.rows.forEach((r: any) => { configMap[r.key] = r.value })

    const reward = parseFloat(configMap.mining_reward || '1.0')
    const cooldownMinutes = parseInt(configMap.mining_cooldown_minutes || '20')
    const cooldownUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000)

    // Compléter la session
    await query(
      `UPDATE mining_sessions
       SET status = 'completed',
           completed_at = NOW(),
           amount_earned = $1,
           cooldown_until = $2
       WHERE id = $3`,
      [reward, cooldownUntil, sessionId]
    )

    // Créditer le solde
    await query(
      `UPDATE balances
       SET frz_balance = frz_balance + $1,
           total_mined = total_mined + $1,
           today_earned = today_earned + $1,
           total_mining_count = total_mining_count + 1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [reward, userId]
    )

    // Enregistrer la transaction
    await query(
      `INSERT INTO transactions
        (user_id, type, amount, reference_id, description)
       VALUES ($1, 'mine', $2, $3, 'Minage complété')`,
      [userId, reward, sessionId]
    )

    // Créditer les commissions de parrainage
    await creditReferralCommissions(userId, reward)

    // Récupérer le nouveau solde
    const newBalance = await query(
      'SELECT frz_balance FROM balances WHERE user_id = $1',
      [userId]
    )

    return NextResponse.json({
      success: true,
      reward,
      newBalance: parseFloat(newBalance.rows[0].frz_balance).toFixed(8),
      cooldownUntil,
    })

  } catch (error) {
    console.error('Mining complete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function creditReferralCommissions(userId: string, miningReward: number) {
  try {
    // Trouver le parrain N1
    const user = await query(
      'SELECT referred_by FROM users WHERE id = $1',
      [userId]
    )

    if (!user.rows[0]?.referred_by) return

    const referrerId = user.rows[0].referred_by
    const commissionN1 = parseFloat((miningReward * 0.20).toFixed(8))

    // Créditer parrain N1
    await query(
      `UPDATE balances SET frz_balance = frz_balance + $1,
       today_earned = today_earned + $1, updated_at = NOW()
       WHERE user_id = $2`,
      [commissionN1, referrerId]
    )

    await query(
      `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'referral_n1', $2, 'Commission parrainage N1')`,
      [referrerId, commissionN1]
    )

    await query(
      `UPDATE referrals SET total_earned = total_earned + $1
       WHERE referrer_id = $2 AND referred_id = $3`,
      [commissionN1, referrerId, userId]
    )

    // Trouver parrain N2
    const referrer = await query(
      'SELECT referred_by FROM users WHERE id = $1',
      [referrerId]
    )

    if (!referrer.rows[0]?.referred_by) return

    const referrerId2 = referrer.rows[0].referred_by
    const commissionN2 = parseFloat((miningReward * 0.10).toFixed(8))

    await query(
      `UPDATE balances SET frz_balance = frz_balance + $1,
       today_earned = today_earned + $1, updated_at = NOW()
       WHERE user_id = $2`,
      [commissionN2, referrerId2]
    )

    await query(
      `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'referral_n2', $2, 'Commission parrainage N2')`,
      [referrerId2, commissionN2]
    )

    // Trouver parrain N3
    const referrer2 = await query(
      'SELECT referred_by FROM users WHERE id = $1',
      [referrerId2]
    )

    if (!referrer2.rows[0]?.referred_by) return

    const referrerId3 = referrer2.rows[0].referred_by
    const commissionN3 = parseFloat((miningReward * 0.05).toFixed(8))

    await query(
      `UPDATE balances SET frz_balance = frz_balance + $1,
       today_earned = today_earned + $1, updated_at = NOW()
       WHERE user_id = $2`,
      [commissionN3, referrerId3]
    )

    await query(
      `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'referral_n3', $2, 'Commission parrainage N3')`,
      [referrerId3, commissionN3]
    )

  } catch (error) {
    console.error('Referral commission error:', error)
  }
}