import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/auth/* (auth endpoints)
     * - /auth/* (auth pages)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon)
     * - public files (png, jpg, svg)
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};

// Protected route patterns
const PROTECTED_ROUTES = ["/", "/add", "/records"];
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];
// Routes that should be accessible regardless of auth state
const PUBLIC_AUTH_ROUTES = ["/auth/callback", "/auth/verify-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check route type
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Public auth routes (like callback) should always be accessible
  if (isPublicAuthRoute) {
    return NextResponse.next();
  }

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (optimistic check)
  // Neon Auth uses __Secure-neon-auth.session_token in production (HTTPS)
  // In development (HTTP), the cookie name doesn't have the __Secure- prefix
  const sessionCookie =
    request.cookies.get("__Secure-neon-auth.session_token") ||
    request.cookies.get("neon-auth.session_token");

  // Allow OAuth callback with session verifier to pass through
  const hasSessionVerifier = request.nextUrl.searchParams.has("neon_auth_session_verifier");

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !sessionCookie && !hasSessionVerifier) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute && sessionCookie) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}
