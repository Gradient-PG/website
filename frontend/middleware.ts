import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply auth to admin routes
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // For admin routes, we'll validate credentials in the route handlers
      // Middleware just checks for presence of credentials
      // The actual database validation happens in each protected route
      if (user && pwd) {
        // Add auth info to headers for route handlers to validate
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-auth-user', user);
        requestHeaders.set('x-auth-pass', pwd);
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }

    // Authentication failed - no credentials provided
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}; 