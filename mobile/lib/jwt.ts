import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'shee-mine-secret-2024'

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}