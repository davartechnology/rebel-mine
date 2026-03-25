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

    const { sessionId, adToken } = await req.json()

    if (!sessionId || !adToken) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier la session et le token
    const miningSession = await query(
      `SELECT * FROM mining_sessions
       WHERE id = $1 AND user_id = $2 AND ad_token = $3 AND status = 'pending'`,
      [sessionId, session.user.id, adToken]
    )

    if (miningSession.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session invalide ou expirée' },
        { status: 400 }
      )
    }

    // Marquer la pub comme vérifiée et démarrer le minage
    await query(
      `UPDATE mining_sessions
       SET ad_verified = true, status = 'mining', started_at = NOW()
       WHERE id = $1`,
      [sessionId]
    )

    return NextResponse.json({
      success: true,
      message: 'Pub vérifiée — minage démarré',
    })

  } catch (error) {
    console.error('Verify ad error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}