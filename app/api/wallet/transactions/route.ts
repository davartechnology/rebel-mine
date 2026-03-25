import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let whereClause = 'WHERE user_id = $1'
    const params: any[] = [session.user.id]

    if (type !== 'all') {
      if (type === 'mine') {
        whereClause += ` AND type = 'mine'`
      } else if (type === 'referral') {
        whereClause += ` AND type IN ('referral_n1', 'referral_n2', 'referral_n3')`
      } else if (type === 'withdrawal') {
        whereClause += ` AND type = 'withdrawal'`
      }
    }

    const result = await query(
      `SELECT id, type, amount, description, status, created_at
       FROM transactions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    )

    const countResult = await query(
      `SELECT COUNT(*) FROM transactions ${whereClause}`,
      params
    )

    const transactions = result.rows.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount).toFixed(8),
      description: t.description,
      status: t.status,
      createdAt: t.created_at,
    }))

    return NextResponse.json({
      transactions,
      total: parseInt(countResult.rows[0].count),
      page,
      hasMore: offset + limit < parseInt(countResult.rows[0].count),
    })

  } catch (error) {
    console.error('Transactions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}