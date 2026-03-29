import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await query(
      `SELECT w.id, w.amount_requested, w.reserve_amount,
              w.fee_amount, w.amount_sent, w.payment_method,
              w.payment_address, w.status, w.withdrawal_number,
              w.requested_at, w.processed_at,
              u.username
       FROM withdrawals w
       JOIN users u ON u.id = w.user_id
       ORDER BY
         CASE w.status WHEN 'pending' THEN 0 ELSE 1 END,
         w.requested_at DESC`
    )

    return NextResponse.json({
      withdrawals: result.rows.map((w: any) => ({
        id: w.id,
        username: w.username,
        requested: parseFloat(w.amount_requested).toFixed(8),
        reserve: parseFloat(w.reserve_amount).toFixed(8),
        fee: parseFloat(w.fee_amount).toFixed(8),
        sent: parseFloat(w.amount_sent).toFixed(8),
        paymentMethod: w.payment_method,
        paymentAddress: w.payment_address,
        status: w.status,
        withdrawalNumber: w.withdrawal_number,
        requestedAt: w.requested_at,
        processedAt: w.processed_at,
      })),
    })

  } catch (error) {
    console.error('Admin withdrawals error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id, status } = await req.json()

    // Mettre à jour le statut du retrait
    await query(
      `UPDATE withdrawals
       SET status = $1, processed_at = NOW()
       WHERE id = $2`,
      [status, id]
    )

    // Mettre à jour la transaction correspondante
    await query(
      `UPDATE transactions
       SET status = $1
       WHERE reference_id = $2
       AND type = 'withdrawal'`,
      [status, id]
    )

    // Si approuvé — notifier dans les transactions avec description mise à jour
    if (status === 'completed') {
      await query(
        `UPDATE transactions
         SET description = 'Retrait payé ✅',
             status = 'completed'
         WHERE reference_id = $1
         AND type = 'withdrawal'`,
        [id]
      )
    }

    if (status === 'rejected') {
      // Rembourser le solde si rejeté
      const withdrawal = await query(
        `SELECT user_id, amount_requested FROM withdrawals WHERE id = $1`,
        [id]
      )

      if (withdrawal.rows.length > 0) {
        const { user_id, amount_requested } = withdrawal.rows[0]

        await query(
          `UPDATE balances
           SET frz_balance = frz_balance + $1,
               total_withdrawn = total_withdrawn - $1,
               updated_at = NOW()
           WHERE user_id = $2`,
          [amount_requested, user_id]
        )

        await query(
          `INSERT INTO transactions
            (user_id, type, amount, description, status)
           VALUES ($1, 'refund', $2, 'Retrait remboursé — rejeté par admin', 'completed')`,
          [user_id, amount_requested]
        )

        await query(
          `UPDATE balances
           SET reserved_balance = reserved_balance - (
             SELECT reserve_amount FROM withdrawals WHERE id = $1
           )
           WHERE user_id = $2`,
          [id, user_id]
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update withdrawal error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}