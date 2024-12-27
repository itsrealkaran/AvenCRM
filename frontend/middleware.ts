import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// List of public routes that don't require authentication

interface JWTPayload {
  id: string;
  role: string;
  companyId?: string;
  exp: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes

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

      // Attempt to refresh the token by calling the backend
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        // Continue with the request since the cookie will be automatically updated
        return NextResponse.next();
      } catch (error) {
        const url = new URL('/sign-in', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
    }

    // If everything is valid, proceed with the request
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /robots.txt (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
