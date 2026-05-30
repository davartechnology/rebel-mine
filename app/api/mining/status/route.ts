import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'shee-mine-secret-2024'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = jwt.verify(auth.substring(7), SECRET) as { userId: string }
    const client = await pool.connect()

    try {
      const result = await client.query(
        'SELECT balance, last_mining FROM users WHERE id = $1',
        [decoded.userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
      }

      const user = result.rows[0]
      const balance = parseFloat(user.balance || '0')
      const lastMining = user.last_mining ? new Date(user.last_mining) : null
      const cooldownMs = 20 * 60 * 1000

      let canMine = true
      let cooldownSeconds = 0

      if (lastMining) {
        const elapsed = Date.now() - lastMining.getTime()
        if (elapsed < cooldownMs) {
          canMine = false
          cooldownSeconds = Math.ceil((cooldownMs - elapsed) / 1000)
        }
      }

      return NextResponse.json({ balance, canMine, cooldownSeconds })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}