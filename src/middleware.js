import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token')?.value;
    const userCookie = request.cookies.get('user')?.value;
    const user = userCookie ? JSON.parse(userCookie) : null;
    const { pathname } = request.nextUrl;

    // 1. Root Redirection
    if (pathname === '/') {
        if (token && user) {
            return NextResponse.redirect(new URL(`/dashboard/${user.role.toLowerCase()}`, request.url));
        }
        return NextResponse.next();
    }

    // 2. Auth Page Protection (Login/Register)
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    if (isAuthPage) {
        if (token && user) {
            return NextResponse.redirect(new URL(`/dashboard/${user.role.toLowerCase()}`, request.url));
        }
        return NextResponse.next();
    }

    // 3. Dashboard Route Protection
    const isDashboardRoute = pathname.startsWith('/dashboard');
    if (isDashboardRoute) {
        if (!token || !user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Role-specific enforcement
        const role = user.role.toLowerCase();
        const targetDashboard = `/dashboard/${role}`;

        if (!pathname.startsWith(targetDashboard)) {
            // Trying to access another role's dashboard -> Redirect to own
            return NextResponse.redirect(new URL(targetDashboard, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/dashboard/:path*',
    ],
};
