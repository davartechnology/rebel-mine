import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    const { amount, paymentMethod, paymentAddress } = await req.json()

    if (!amount || !paymentMethod || !paymentAddress) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (!['faucetpay', 'usdt_trc20'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      )
    }

    // Récupérer infos user
    const userResult = await query(
      'SELECT withdrawal_count FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User non trouvé' }, { status: 404 })
    }

    const withdrawalCount = userResult.rows[0].withdrawal_count

    // Calculer le seuil selon le numéro de retrait
    let minimumRequired = 10.0
    if (withdrawalCount === 0) minimumRequired = 10.0
    else if (withdrawalCount === 1) minimumRequired = 30.0
    else if (withdrawalCount === 2) minimumRequired = 75.0
    else minimumRequired = 250.0

    if (parseFloat(amount) < minimumRequired) {
      return NextResponse.json(
        { error: `Minimum requis pour ce retrait : ${minimumRequired} REBEL` },
        { status: 400 }
      )
    }

    // Vérifier le solde
    const balanceResult = await query(
      'SELECT frz_balance FROM balances WHERE user_id = $1',
      [userId]
    )

    const currentBalance = parseFloat(balanceResult.rows[0]?.frz_balance || 0)

    if (currentBalance < parseFloat(amount)) {
      return NextResponse.json(
        { error: 'Solde insuffisant' },
        { status: 400 }
      )
    }

    // Vérifier cooldown retrait 48h
    const lastWithdrawal = await query(
      `SELECT requested_at FROM withdrawals
       WHERE user_id = $1 AND status != 'rejected'
       ORDER BY requested_at DESC LIMIT 1`,
      [userId]
    )

    if (lastWithdrawal.rows.length > 0) {
      const lastDate = new Date(lastWithdrawal.rows[0].requested_at)
      const hoursDiff = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60)

      if (hoursDiff < 48) {
        const hoursLeft = Math.ceil(48 - hoursDiff)
        return NextResponse.json(
          { error: `Prochain retrait disponible dans ${hoursLeft}h` },
          { status: 400 }
        )
      }
    }

    // Calculer les montants
    const requestedAmount = parseFloat(parseFloat(amount).toFixed(8))
    const reservePercent = 0.10
    const feePercent = 0.03

    const reserveAmount = parseFloat((requestedAmount * reservePercent).toFixed(8))
    const feeAmount = parseFloat((requestedAmount * feePercent).toFixed(8))
    const amountSent = parseFloat((requestedAmount - reserveAmount - feeAmount).toFixed(8))

    // Vérifier minimum USDT (2$)
    const rebelPriceUsd = 0.002
    const amountUsd = amountSent * rebelPriceUsd

    if (paymentMethod === 'usdt_trc20' && amountUsd < 2.0) {
      return NextResponse.json(
        { error: 'Minimum 2$ requis pour un retrait USDT TRC20' },
        { status: 400 }
      )
    }

    // Déduire du solde
    await query(
      `UPDATE balances
       SET frz_balance = frz_balance - $1,
           reserved_balance = reserved_balance + $2,
           total_withdrawn = total_withdrawn + $3,
           updated_at = NOW()
       WHERE user_id = $4`,
      [requestedAmount, reserveAmount, amountSent, userId]
    )

    // Créer la demande de retrait
    const withdrawal = await query(
      `INSERT INTO withdrawals
        (user_id, amount_requested, reserve_amount, fee_amount,
         amount_sent, payment_method, payment_address,
         withdrawal_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING id`,
      [
        userId,
        requestedAmount,
        reserveAmount,
        feeAmount,
        amountSent,
        paymentMethod,
        paymentAddress,
        withdrawalCount + 1,
      ]
    )

    // Incrémenter le compteur de retraits
    await query(
      'UPDATE users SET withdrawal_count = withdrawal_count + 1 WHERE id = $1',
      [userId]
    )

    // Enregistrer la transaction
    await query(
      `INSERT INTO transactions
        (user_id, type, amount, reference_id, description)
       VALUES ($1, 'withdrawal', $2, $3, $4)`,
      [
        userId,
        requestedAmount,
        withdrawal.rows[0].id,
        `Retrait #${withdrawalCount + 1} via ${paymentMethod}`,
      ]
    )

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawal.rows[0].id,
      summary: {
        requested: requestedAmount,
        reserve: reserveAmount,
        fee: feeAmount,
        sent: amountSent,
        sentUsd: amountUsd.toFixed(4),
        paymentMethod,
        paymentAddress,
      },
      message: 'Demande de retrait soumise. Traitement sous 24-72h.',
    })

  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const result = await query(
      `SELECT id, amount_requested, reserve_amount, fee_amount,
              amount_sent, payment_method, payment_address,
              status, withdrawal_number, requested_at, processed_at
       FROM withdrawals
       WHERE user_id = $1
       ORDER BY requested_at DESC`,
      [session.user.id]
    )

    // Récupérer le prochain seuil
    const userResult = await query(
      'SELECT withdrawal_count FROM users WHERE id = $1',
      [session.user.id]
    )

    const withdrawalCount = userResult.rows[0]?.withdrawal_count || 0
    let nextMinimum = 10.0
    if (withdrawalCount === 0) nextMinimum = 10.0
    else if (withdrawalCount === 1) nextMinimum = 30.0
    else if (withdrawalCount === 2) nextMinimum = 75.0
    else nextMinimum = 250.0

    return NextResponse.json({
      withdrawals: result.rows.map((w: any) => ({
        id: w.id,
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
      withdrawalCount,
      nextMinimum,
    })

  } catch (error) {
    console.error('Withdrawals list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}