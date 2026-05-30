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
      const userResult = await client.query(
        'SELECT referral_code FROM users WHERE id = $1',
        [decoded.userId]
      )
      const referralCode = userResult.rows[0]?.referral_code

      const referralsResult = await client.query(
        `SELECT username, created_at as "joinedAt" FROM users 
         WHERE referred_by = $1 ORDER BY created_at DESC`,
        [decoded.userId]
      )

      const referrals = referralsResult.rows.map(r => ({
        username: r.username,
        joinedAt: r.joinedAt,
        bonus: 0.5,
      }))

      return NextResponse.json({
        referralCode,
        totalReferrals: referrals.length,
        referralEarnings: referrals.length * 0.5,
        referrals,
      })
    } finally {
      client.release()
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}