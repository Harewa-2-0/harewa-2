import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access-token')?.value;

  // Comprehensive list of protected routes
  const protectedRoutes = [
    '/user/profile',
    '/profile',
    '/settings',
    '/dashboard',
    '/cart'
  ];

  const isProtectedRoute = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !token) {
    // No token - redirect to signin
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/user/profile/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/cart/:path*'
  ]
};
