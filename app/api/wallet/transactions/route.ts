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
        `SELECT type, amount, created_at as "createdAt" 
         FROM transactions WHERE user_id = $1 
         ORDER BY created_at DESC LIMIT 50`,
        [decoded.userId]
      )

      const transactions = result.rows
      const totalEarned = transactions
        .filter(t => t.type !== 'withdrawal')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      const totalMinings = transactions.filter(t => t.type === 'mining').length

      return NextResponse.json({ transactions, totalEarned, totalMinings })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}