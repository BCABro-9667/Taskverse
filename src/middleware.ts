
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Assuming 'userId' cookie is set on successful login and cleared on logout.
// This is a simplified approach. For production, use secure, httpOnly session cookies.
const AUTH_COOKIE_NAME = 'userId'; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userIdCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If user is authenticated
  if (userIdCookie) {
    // If on an auth page (login/register), redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not authenticated
  else {
    // If trying to access a protected page (not an auth page and not the root for initial landing)
    // and not an API route
    if (!isAuthPage && pathname !== '/' && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (any other static assets if needed)
     * - Public API routes if any (e.g. /api/public/*)
     *
     * Note: API routes under /api/ are generally excluded by default
     * if not explicitly listed, but it's good practice to be clear.
     * The current pattern `'/((?!api|_next/static|...` already excludes /api/
     * but if you have specific public API endpoints that should always be accessible,
     * ensure they are not caught by the auth redirection logic.
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
