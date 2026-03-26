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

    // Annuler toutes les sessions pending/mining de plus de 10 minutes
    await query(
      `UPDATE mining_sessions
       SET status = 'cancelled'
       WHERE user_id = $1
       AND status IN ('pending', 'mining')
       AND started_at < NOW() - INTERVAL '10 minutes'`,
      [session.user.id]
    )

    // Annuler aussi les sessions très récentes bloquées
    await query(
      `UPDATE mining_sessions
       SET status = 'cancelled'
       WHERE user_id = $1
       AND status IN ('pending', 'mining')`,
      [session.user.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Sessions réinitialisées'
    })

  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}