import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Pages publiques — toujours accessibles
  const publicPaths = ['/login', '/register', '/api/auth', '/_next', '/favicon.ico', '/public', '/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png']
  const isPublic = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublic) {
    return NextResponse.next()
  }
  
  // Vérifier si cookie de session existe
  const sessionCookie = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token')
  
  // Si pas de session et pas sur page publique → rediriger vers login
  if (!sessionCookie && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Si connecté et sur page auth → rediriger vers home
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.svg|icon-192.png|icon-512.png|public|api/auth).*)',
  ],
}