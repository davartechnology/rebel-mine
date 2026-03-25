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

    // Vérifier qu'aucune session active n'existe
    const activeCheck = await query(
      `SELECT id FROM mining_sessions
       WHERE user_id = $1
       AND status IN ('pending', 'mining')`,
      [userId]
    )

    if (activeCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Une session de minage est déjà en cours' },
        { status: 400 }
      )
    }

    // Vérifier le cooldown
    const lastSession = await query(
      `SELECT cooldown_until FROM mining_sessions
       WHERE user_id = $1
       AND status = 'completed'
       ORDER BY completed_at DESC LIMIT 1`,
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
        (user_id, ad_type, ad_token, status)
       VALUES ($1, $2, $3, 'pending')
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