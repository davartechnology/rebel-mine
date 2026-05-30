import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'shee-mine-secret-2024'

export async function POST(req: NextRequest) {
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

      const user = result.rows[0]
      const lastMining = user.last_mining ? new Date(user.last_mining) : null
      const cooldownMs = 20 * 60 * 1000

      if (lastMining && (Date.now() - lastMining.getTime()) < cooldownMs) {
        return NextResponse.json({ error: 'Cooldown actif' }, { status: 429 })
      }

      const newBalance = parseFloat(user.balance || '0') + 1.0

      await client.query(
        'UPDATE users SET balance = $1, last_mining = NOW() WHERE id = $2',
        [newBalance, decoded.userId]
      )

      return NextResponse.json({ success: true, balance: newBalance })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}