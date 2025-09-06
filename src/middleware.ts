import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', "/survey", "/chat"];

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/'];

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true; // If we can't decode it, consider it expired
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If it's a protected route and no valid token exists, redirect to login
  if (isProtectedRoute) {
    if (!accessToken || isTokenExpired(accessToken)) {
      // Check if we have a valid refresh token
      if (!refreshToken || isTokenExpired(refreshToken)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // If refresh token is valid but access token is expired,
      // let the request continue and handle token refresh in the app
    }
  }
  
  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (accessToken && !isTokenExpired(accessToken) && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  // Continue with the request
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
