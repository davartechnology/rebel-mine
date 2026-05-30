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
      // Vérifier cooldown
      const result = await client.query(
        'SELECT balance, last_mining, referred_by FROM users WHERE id = $1',
        [decoded.userId]
      )
      const user = result.rows[0]
      const lastMining = user.last_mining ? new Date(user.last_mining) : null
      const cooldownMs = 20 * 60 * 1000

      if (lastMining && (Date.now() - lastMining.getTime()) < cooldownMs) {
        return NextResponse.json({ error: 'Cooldown actif' }, { status: 429 })
      }

      const miningReward = 1.0
      const newBalance = parseFloat(user.balance || '0') + miningReward

      // Mettre à jour le mineur
      await client.query(
        'UPDATE users SET balance = $1, last_mining = NOW() WHERE id = $2',
        [newBalance, decoded.userId]
      )

      // Enregistrer la transaction de minage
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, created_at)
         VALUES ($1, 'mining', $2, NOW())
         ON CONFLICT DO NOTHING`,
        [decoded.userId, miningReward]
      )

      // ── Commissions multi-niveau ──────────────────────────────────────────
      // Niveau 1 : parrain direct → 20%
      // Niveau 2 : grand-parrain → 10%
      // Niveau 3 : arrière-grand-parrain → 5%
      const levels = [
        { percent: 0.20, type: 'referral_level1' },
        { percent: 0.10, type: 'referral_level2' },
        { percent: 0.05, type: 'referral_level3' },
      ]

      let currentUserId = decoded.userId

      for (const level of levels) {
        // Trouver le parrain du currentUserId
        const parentResult = await client.query(
          'SELECT id, balance, referred_by FROM users WHERE id = (SELECT referred_by FROM users WHERE id = $1)',
          [currentUserId]
        )

        if (parentResult.rows.length === 0) break

        const parent = parentResult.rows[0]
        const commission = miningReward * level.percent
        const parentNewBalance = parseFloat(parent.balance || '0') + commission

        await client.query(
          'UPDATE users SET balance = $1 WHERE id = $2',
          [parentNewBalance, parent.id]
        )

        await client.query(
          `INSERT INTO transactions (user_id, type, amount, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [parent.id, level.type, commission]
        )

        currentUserId = parent.id
      }

      return NextResponse.json({ success: true, balance: newBalance })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}