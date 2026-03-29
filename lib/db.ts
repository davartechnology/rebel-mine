import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

pool.on('connect', () => {
  console.log('New DB connection established')
})

export default pool

export async function query(text: string, params?: any[]) {
  let retries = 3
  while (retries > 0) {
    let client
    try {
      client = await pool.connect()
      const result = await client.query(text, params)
      return result
    } catch (error: any) {
      retries--
      console.error(`Query error (${3 - retries}/3):`, error.message)
      if (retries === 0) throw error
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      if (client) client.release()
    }
  }
  throw new Error('Query failed after 3 retries')
}