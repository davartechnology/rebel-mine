import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import jwt from 'jsonwebtoken'

export async function getAuthUser(req?: NextRequest): Promise<string | null> {
  // 1. Essayer le token Bearer (mobile Flutter)
  if (req) {
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(
          token,
          process.env.NEXTAUTH_SECRET!
        ) as { userId: string }
        return decoded.userId
      } catch {
        return null
      }
    }
  }

  // 2. Essayer la session NextAuth (web)
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch {
    return null
  }
}
