import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isPublicPage = pathname === '/'

  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
