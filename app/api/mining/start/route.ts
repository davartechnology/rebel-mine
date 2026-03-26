import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id

    // Nettoyer automatiquement les sessions bloquées
    // Une session pending depuis plus de 2 minutes est considérée bloquée
    // Une session mining depuis plus de 310 secondes est considérée bloquée
    await query(
      `UPDATE mining_sessions
       SET status = 'cancelled'
       WHERE user_id = $1
       AND (
         (status = 'pending' AND started_at < NOW() - INTERVAL '2 minutes')
         OR
         (status = 'mining' AND started_at < NOW() - INTERVAL '310 seconds')
       )`,
      [userId]
    )

    // Vérifier s'il reste une session vraiment active
    const activeCheck = await query(
      `SELECT id, status, started_at FROM mining_sessions
       WHERE user_id = $1
       AND status IN ('pending', 'mining')`,
      [userId]
    )

    if (activeCheck.rows.length > 0) {
      const active = activeCheck.rows[0]
      const startedAt = new Date(active.started_at)
      const elapsedSeconds = (Date.now() - startedAt.getTime()) / 1000

      return NextResponse.json(
        {
          error: 'Une session de minage est déjà en cours',
          sessionId: active.id,
          elapsedSeconds: Math.floor(elapsedSeconds),
        },
        { status: 400 }
      )
    }

    // Vérifier le cooldown
    const lastSession = await query(
      `SELECT cooldown_until from mining_sessions
       where user_id = $1
       and status = 'completed'
       order by completed_at desc limit 1`,
      [userId]
    )

    if (lastSession.rows.length > 0) {
      const cooldownEnd = new Date(lastSession.rows[0].cooldown_until)
      if (cooldownEnd > new Date()) {
        const remaining = Math.ceil(
          (cooldownEnd.getTime() - new Date().getTime()) / 1000
        )
        return NextResponse.json(
          { error: `Cooldown actif. Encore ${remaining} secondes.` },
          { status: 400 }
        )
      }
    }

    // Sélectionner type de pub aléatoire
    const adType = Math.random() < 0.5 ? 'video_reward' : 'interstitial'

    // Générer token unique pour cette session
    const adToken = crypto.randomBytes(32).toString('hex')

    // Créer la session de minage
    const newSession = await query(
      `INSERT INTO mining_sessions
        (user_id, ad_type, ad_token, status, started_at)
       VALUES ($1, $2, $3, 'pending', NOW())
       RETURNING id, ad_type`,
      [userId, adType, adToken]
    )

    return NextResponse.json({
      success: true,
      sessionId: newSession.rows[0].id,
      adType: newSession.rows[0].ad_type,
      adToken,
    })

  } catch (error) {
    console.error('Mining start error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}