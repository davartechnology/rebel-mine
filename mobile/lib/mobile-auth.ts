import { NextRequest } from 'next/server'

export async function getMobileUserId(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.substring(7)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))

    if (decoded.exp < Date.now()) return null

    return decoded.userId
  } catch {
    return null
  }
}