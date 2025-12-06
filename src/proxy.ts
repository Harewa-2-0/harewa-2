import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

export function proxy(req: NextRequest) {
    const token = req.cookies.get('access-token')?.value;
    const pathname = req.nextUrl.pathname;

    // Handle root path with role-based routing
    if (pathname === '/') {
        if (token) {
            try {
                const decoded = verifyAccessToken(token);
                if (decoded.role === 'admin') {
                    // Admin users go directly to admin dashboard
                    return NextResponse.redirect(new URL('/admin', req.url));
                }
                // For clients or any other role, redirect to /home
                return NextResponse.redirect(new URL('/home', req.url));
            } catch {
                // Invalid token, redirect to /home (public)
                return NextResponse.redirect(new URL('/home', req.url));
            }
        }
        // No token, redirect to /home (public)
        return NextResponse.redirect(new URL('/home', req.url));
    }

    // Comprehensive list of protected routes
    const protectedRoutes = [
        '/user/profile',
        '/profile',
        '/settings',
        '/dashboard',
        '/cart',
        '/checkout'
    ];

    const isProtectedRoute = protectedRoutes.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtectedRoute && !token) {
        // No token - redirect to signin
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    return NextResponse.next();
}

// Configure which paths the proxy should run on
export const config = {
    matcher: [
        '/',
        '/user/profile/:path*',
        '/profile/:path*',
        '/settings/:path*',
        '/dashboard/:path*',
        '/cart/:path*',
        '/checkout/:path*'
    ]
};
