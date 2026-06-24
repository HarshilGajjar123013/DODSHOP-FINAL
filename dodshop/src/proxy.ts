import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dod-atelier-fallback-secret-key-at-least-32-bytes-long'
);

const COOKIE_NAME = 'dod-customer-token';

const PROTECTED_ROUTES = [
  '/profile',
  '/order',
  '/settings',
  '/checkout',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass public files, sitemaps, robots, favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // 2. Fetch the customer session token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 3. Guards for Login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        // If already logged in, redirect to profile
        return NextResponse.redirect(new URL('/profile', request.url));
      } catch {
        // Token is invalid, let them log in again (clear token cookie)
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    return NextResponse.next();
  }

  // 4. Guards for protected customer pages
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Allow access, pass down user details in headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-customer-id', payload.id as string);
      requestHeaders.set('x-customer-email', payload.email as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('Customer proxy token validation failed:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
