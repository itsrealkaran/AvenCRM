import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

interface JWTPayload {
  id: string;
  role: string;
  companyId?: string;
  exp: number;
}

// List of public routes that don't require authentication
const publicRoutes = ['/', '/sign-in', '/sign-up', '/forgot-password'];

// List of protected routes that require authentication
const protectedRoutes = ['/agent', '/admin', '/superadmin', '/teamleader'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow public routes without authentication
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If user is already authenticated, redirect to dashboard
    const accessToken = request.cookies.get('Authorization')?.value;
    if (accessToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(accessToken);
        if (decoded?.exp * 1000 > Date.now()) {
          const role = decoded.role.toLowerCase();
          // Redirect team leaders to /agent route
          if (role === 'team_leader') {
            const redirectResponse = NextResponse.redirect(new URL('/teamleader', request.url));
            redirectResponse.headers.set('x-middleware-cache', 'no-cache');
            return redirectResponse;
          }
          const redirectResponse = NextResponse.redirect(new URL(`/${role}`, request.url));
          redirectResponse.headers.set('x-middleware-cache', 'no-cache');
          return redirectResponse;
        }
      } catch (error) {
        toast.error('Invalid token');
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        redirectResponse.headers.set('x-middleware-cache', 'no-cache');
        return redirectResponse;
      }
    }
    const redirectResponse = NextResponse.next();
    redirectResponse.headers.set('x-middleware-cache', 'no-cache'); // ! FIX: Disable caching
    return redirectResponse;
  }

  // Check if the current path requires authentication
  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!requiresAuth) {
    // If it's not a protected route, proceed normally
    return NextResponse.next();
  }

  // Get the access token from cookie
  const accessToken = request.cookies.get('Authorization')?.value;

  if (!accessToken) {
    // give a warning that user is not authenticated
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    redirectResponse.headers.set('x-middleware-cache', 'no-cache');
    return redirectResponse;
  }

  try {
    // Decode and validate token
    const decoded = jwtDecode<JWTPayload>(accessToken);

    // Check token expiration
    if (decoded?.exp * 1000 < Date.now()) {
      // Token is expired - redirect to sign-in
      const url = new URL('/', request.url);
      url.searchParams.set('callbackUrl', pathname);
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('x-middleware-cache', 'no-cache');
      return redirectResponse;
    }

    // Validate role-based access
    const role = decoded.role.toLowerCase();

    // Handle team leader redirection
    if (role === 'team_leader') {
      // Allow access to /agent route for team leaders
      if (pathname.startsWith('/agent') || pathname.startsWith('/dashboard')) {
        return NextResponse.next();
      }
      // Redirect to /agent for any other routes
      const redirectResponse = NextResponse.redirect(new URL('/agent', request.url));
      redirectResponse.headers.set('x-middleware-cache', 'no-cache');
      return redirectResponse;
    }

    // Redirect to appropriate role-based route
    const redirectResponse = NextResponse.redirect(new URL(`/${role}`, request.url));
    redirectResponse.headers.set('x-middleware-cache', 'no-cache');
    return redirectResponse;
  } catch (error) {
    // Invalid token - redirect to sign-in
    const url = new URL('/', request.url);
    url.searchParams.set('callbackUrl', pathname);
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('x-middleware-cache', 'no-cache');
    return redirectResponse;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
