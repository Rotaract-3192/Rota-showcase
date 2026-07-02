import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a middleware Supabase client that securely reads/writes cookies
  const supabase = createMiddlewareClient({ req, res });

  // Refresh the session cookie
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/portal') || req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/district');
  const isAuthRoute = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup';

  if (isProtectedRoute && !session) {
    // Redirect unauthenticated users to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && session) {
    // Redirect authenticated users away from auth pages
    // Routing logic is handled cleanly in useAuth, so default fallback here
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/portal/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
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
