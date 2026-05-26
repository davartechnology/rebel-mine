import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        )
      }

      const user = result.rows[0]
      const isValid = await bcrypt.compare(password, user.password_hash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        )
      }

      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      )

      const tokenData = JSON.stringify({
        userId: user.id,
        email: user.email,
        exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
      })
      const token = Buffer.from(tokenData).toString('base64')

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          referralCode: user.referral_code,
        },
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Mobile auth error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}