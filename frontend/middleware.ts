import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// List of public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

// Protected routes and their allowed roles
const protectedRoutes = {
  '/agent': ['AGENT'],
  '/company': ['ADMIN'],
  '/superadmin': ['SUPERADMIN'],
};

interface JWTPayload {
  id: string;
  role: string;
  companyId?: string;
  exp: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    // If it's not a protected route, proceed normally
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

    // Get user role and validate access
    const userRole = decoded.role;
    const currentRoute = Object.entries(protectedRoutes).find(([route]) =>
      pathname.startsWith(route)
    );

    if (currentRoute && !currentRoute[1].includes(userRole)) {
      // User doesn't have permission for this route
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If everything is valid, proceed with the request
    const response = NextResponse.next();

    // No need to manually set Authorization header as it's already in the cookie
    return response;
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
