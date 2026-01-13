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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected or auth route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (optimistic check)
  // Neon Auth uses __Secure-neon-auth.session_token
  const sessionCookie = request.cookies.get("__Secure-neon-auth.session_token");

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !sessionCookie) {
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
