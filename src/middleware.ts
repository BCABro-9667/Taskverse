
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_USER_ID_KEY = 'userId'; // Key used in localStorage by AuthContext

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Attempt to check for a simulated auth status. 
  // Cookies are accessible in middleware. localStorage is not.
  // For a robust solution, use actual session cookies (e.g., httpOnly).
  // Here, we'll check a simple cookie if you were to set one upon login,
  // OR, more practically for this setup, redirect to login if not on auth pages and no session hint.
  
  // This is a simplified check. In a real app, you'd verify a session token.
  // We assume if 'userId' is in localStorage on client, user is "logged in".
  // Middleware can't access localStorage, so this logic is more for conceptual route protection.
  // A common pattern is to have an API route that verifies a session cookie.

  const publicPaths = ['/login', '/register']; // Add any public pages like /about, /contact
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If trying to access a protected route without a session hint (e.g. no userId cookie)
  // This is a placeholder for actual session validation.
  // For now, let's assume if it's not a public path, it needs auth.
  // And if user is on a public path but "logged in" (has a session hint), redirect to dashboard.
  // This part is tricky without actual session cookies accessible by middleware.

  // For this iteration, since AuthContext handles client-side redirection based on localStorage,
  // middleware will primarily ensure that unauthenticated users trying to access `/` (HomePage)
  // are redirected to `/login` if they are not already going there.
  // And authenticated users trying to access `/login` are redirected to `/dashboard`.

  // This is a very basic middleware. Proper auth needs secure session management.
  // Let's keep it simple: allow all navigation and let client-side AuthContext handle redirects.
  // The main purpose of data persistence is now in MongoDB. The auth flow itself is minimal.

  // If you create /login and /register pages, you can add redirection logic here.
  // Example:
  // const userIdCookie = request.cookies.get(AUTH_USER_ID_KEY)?.value;
  // if (userIdCookie && isPublicPath) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
  // if (!userIdCookie && !isPublicPath && pathname !== '/') { // allow access to HomePage for initial load
  //    if (pathname.startsWith('/api/')) return NextResponse.next(); // Allow API routes
  //    return NextResponse.redirect(new URL('/login', request.url));
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
