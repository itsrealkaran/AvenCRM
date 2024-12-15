import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is going to the backend URL
  if (request.nextUrl.href.startsWith(process.env.NEXT_PUBLIC_BACKEND_URL || '')) {
    // Get the access token from the cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
      // Clone the request headers and add the Authorization header
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);

      // Create a new request with the updated headers
      const newRequest = new NextRequest(request, {
        headers: requestHeaders,
      });

      // Return the new request
      return NextResponse.next({
        request: newRequest,
      });
    }
  }

  // For all other requests, continue without modification
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
