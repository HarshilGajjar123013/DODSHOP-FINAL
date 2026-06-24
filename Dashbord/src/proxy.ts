import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dod-atelier-fallback-secret'
);

const COOKIE_NAME = 'dod-admin-token';

// Pages that require SUPER_ADMIN role
const SUPER_ADMIN_ROUTES = [
  '/analytics',
  '/cms',
  '/gallery',
  '/marketing',
  '/administration',
  '/settings',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass public files, api/auth/login, and next.js internal assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  // 2. Fetch the session token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 3. Guards for Login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        // If already logged in, redirect to overview
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Token is invalid, let them log in again (clear token cookie)
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    return NextResponse.next();
  }

  // 4. Guarantees for all other pages & APIs
  if (!token) {
    // If accessing API, return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // If page, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string;

    // 5. Role validation for SUPER_ADMIN restricted sections
    const isSuperAdminRoute = SUPER_ADMIN_ROUTES.some(route => 
      pathname.startsWith(route) || pathname.startsWith(`/api${route}`)
    );

    if (isSuperAdminRoute && userRole !== 'SUPER_ADMIN') {
      // Block MANAGER from accessing SUPER_ADMIN APIs
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Redirect MANAGER from accessing SUPER_ADMIN pages
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access, pass down user role and details in headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-role', userRole);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Middleware token validation failed:', error);
    // If API, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }
    // Otherwise redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (public auth endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
