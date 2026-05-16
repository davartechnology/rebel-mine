import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export async function getMobileUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET!
    ) as { userId: string; email: string; username: string }

    return decoded
  } catch (error) {
    return null
  }
}
