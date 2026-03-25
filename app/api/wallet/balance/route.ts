import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = jwt.decode(token) as { email?: string } | null
    
    if (!decoded?.email) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const result = await query(
      'SELECT balance FROM users WHERE email = $1',
      [decoded.email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ balance: result.rows[0].balance })
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}