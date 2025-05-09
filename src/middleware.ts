
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// const AUTH_COOKIE_NAME = 'taskmaster_auth_status'; // Using a simple cookie for demo

export function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl;
  // const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === 'true';

  // const authRoutes = ['/login', '/register'];
  // const protectedRoutes = ['/dashboard', '/profile', '/tasks'];

  // if (isAuthenticated) {
  //   if (authRoutes.some(route => pathname.startsWith(route))) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url));
  //   }
  // } else {
  //   if (protectedRoutes.some(route => pathname.startsWith(route))) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (any other static assets if needed)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
