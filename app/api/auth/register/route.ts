import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { generateReferralCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, referralCode } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mot de passe trop court (8 caractères minimum)' },
        { status: 400 }
      )
    }

    // Vérifier email existant
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Vérifier username existant
    const existingUsername = await query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    )
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 400 }
      )
    }

    // Trouver le parrain si code fourni
    let referrerId = null
    if (referralCode && referralCode.trim() !== '') {
      const referrer = await query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referralCode.toUpperCase()]
      )
      if (referrer.rows.length > 0) {
        referrerId = referrer.rows[0].id
      }
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 12)

    // Générer un code de parrainage unique
    let newReferralCode = generateReferralCode()
    let codeExists = true
    while (codeExists) {
      const check = await query(
        'SELECT id FROM users WHERE referral_code = $1',
        [newReferralCode]
      )
      if (check.rows.length === 0) codeExists = false
      else newReferralCode = generateReferralCode()
    }

    // Créer l'utilisateur
    const newUser = await query(
      `INSERT INTO users
        (email, password_hash, username, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        email.toLowerCase(),
        passwordHash,
        username.toLowerCase(),
        newReferralCode,
        referrerId,
      ]
    )

    const userId = newUser.rows[0].id

    // Créer le solde avec bonus inscription
    await query(
      `INSERT INTO balances
        (user_id, frz_balance, total_mined)
       VALUES ($1, 0.5, 0.5)`,
      [userId]
    )

    // Enregistrer la transaction bonus
    await query(
      `INSERT INTO transactions
        (user_id, type, amount, description)
       VALUES ($1, 'bonus', 0.5, 'Bonus d\'inscription')`,
      [userId]
    )

    // Enregistrer le parrainage
    if (referrerId) {
      await query(
        `INSERT INTO referrals (referrer_id, referred_id, level)
         VALUES ($1, $2, 1)`,
        [referrerId, userId]
      )

      // Mettre à jour le tier du parrain
      const refCount = await query(
        'SELECT COUNT(*) FROM referrals WHERE referrer_id = $1',
        [referrerId]
      )
      const count = parseInt(refCount.rows[0].count)
      let tier = 'bronze'
      if (count >= 15) tier = 'gold'
      else if (count >= 5) tier = 'silver'

      await query(
        'UPDATE users SET tier = $1 WHERE id = $2',
        [tier, referrerId]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Réessayez.' },
      { status: 500 }
    )
  }
}