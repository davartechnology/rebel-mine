import { query } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function initDatabase() {
  console.log('🔄 Initialisation de la base de données REBEL Mine...')

  try {
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const statement of statements) {
      await query(statement)
      process.stdout.write('.')
    }

    console.log('\n✅ Base de données initialisée avec succès !')
    console.log('Tables créées : users, balances, mining_sessions, transactions, withdrawals, referrals, app_config')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

initDatabase()