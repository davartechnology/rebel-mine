import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await query(
      'SELECT key, value FROM app_config ORDER BY key'
    )

    return NextResponse.json({ config: result.rows })

  } catch (error) {
    console.error('Admin config error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { config } = await req.json()

    for (const [key, value] of Object.entries(config)) {
      await query(
        `UPDATE app_config SET value = $1, updated_at = NOW()
         WHERE key = $2`,
        [value, key]
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update config error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}