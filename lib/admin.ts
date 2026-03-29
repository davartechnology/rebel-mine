import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false
  return session.user.email === process.env.ADMIN_EMAIL
}