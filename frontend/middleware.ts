import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  role: string;
  companyId?: string;
  exp: number;
}

// List of public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the current path is a dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (!isDashboardRoute) {
    // If it's not a dashboard route, proceed normally
    return NextResponse.next();
  }

  // Get the access token from cookie
  const accessToken = request.cookies.get('Authorization')?.value;

  if (!accessToken) {
    // Redirect to login if no token is present
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Decode and validate token
    const decoded = jwtDecode<JWTPayload>(accessToken);

    // Check token expiration
    if (decoded?.exp * 1000 < Date.now()) {
      // Token is expired - try to use refresh token
      const refreshToken = request.cookies.get('RefreshToken')?.value;

      if (!refreshToken) {
        const url = new URL('/sign-in', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Redirect to refresh token endpoint
      const response = NextResponse.redirect(new URL('/api/auth/refresh-token', request.url));
      response.headers.set('x-original-path', pathname);
      return response;
    }

    // Token is valid, proceed with the request
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside public directory)
     * 4. /examples (inside public directory)
     * 5. all root files inside public (e.g. /favicon.ico)
     */
    '/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)',
  ],
};
