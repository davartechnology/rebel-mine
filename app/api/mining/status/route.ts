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

    // Vérifier la dernière session de minage
    const lastSession = await query(
      `SELECT * FROM mining_sessions
       WHERE user_id = $1
       ORDER BY started_at DESC
       LIMIT 1`,
      [userId]
    )

    // Récupérer la config
    const config = await query(
      `SELECT key, value FROM app_config
       WHERE key IN ('mining_cooldown_minutes', 'mining_reward', 'mining_animation_seconds')`
    )

    const configMap: Record<string, string> = {}
    config.rows.forEach((r: any) => { configMap[r.key] = r.value })

    const cooldownMinutes = parseInt(configMap.mining_cooldown_minutes || '20')
    const miningReward = parseFloat(configMap.mining_reward || '1.0')
    const animationSeconds = parseInt(configMap.mining_animation_seconds || '300')

    // Récupérer le solde
    const balance = await query(
      `SELECT frz_balance, total_mining_count, today_earned
       FROM balances WHERE user_id = $1`,
      [userId]
    )

    let canMine = true
    let cooldownUntil = null
    let cooldownRemainingSeconds = 0
    let activeSession = null

    if (lastSession.rows.length > 0) {
      const last = lastSession.rows[0]

      // Vérifier cooldown
      if (last.cooldown_until) {
        const cooldownEnd = new Date(last.cooldown_until)
        const now = new Date()

        if (cooldownEnd > now) {
          canMine = false
          cooldownUntil = cooldownEnd
          cooldownRemainingSeconds = Math.ceil(
            (cooldownEnd.getTime() - now.getTime()) / 1000
          )
        }
      }

      // Vérifier si session active (minage en cours)
      if (last.status === 'mining') {
        activeSession = {
          id: last.id,
          startedAt: last.started_at,
          animationSeconds,
        }
        canMine = false
      }
    }

    const bal = balance.rows[0] || {
      frz_balance: 0,
      total_mining_count: 0,
      today_earned: 0,
    }

    return NextResponse.json({
      canMine,
      cooldownUntil,
      cooldownRemainingSeconds,
      activeSession,
      balance: parseFloat(bal.frz_balance).toFixed(8),
      totalMiningCount: bal.total_mining_count,
      todayEarned: parseFloat(bal.today_earned).toFixed(8),
      miningReward,
      animationSeconds,
      cooldownMinutes,
    })

  } catch (error) {
    console.error('Mining status error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}