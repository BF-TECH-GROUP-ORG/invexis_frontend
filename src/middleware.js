import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Extract locale from pathname (e.g., /en/inventory -> en)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en"; // Default to 'en' if no locale found
  
  // Remove locale from pathname for comparison
  const pathWithoutLocale = localeMatch 
    ? pathname.slice(locale.length + 1) || "/" 
    : pathname;

  // Define public routes that don't require authentication (without locale prefix)
  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/otp-login",
    "/auth/google-callback",
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  // Get the refresh token from cookies
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Check for bypass flag (development only)
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

  // If user is authenticated and on home page, redirect to dashboard
  if (refreshToken && pathWithoutLocale === "/") {
    return NextResponse.redirect(new URL(`/${locale}/inventory/dashboard`, request.url));
  }

  // Allow access to public paths
  if (isPublicPath) {
    // If user is already authenticated and trying to access login/signup, redirect to dashboard
    if (refreshToken && (pathWithoutLocale.includes("/auth/login") || pathWithoutLocale.includes("/auth/signup"))) {
      return NextResponse.redirect(new URL(`/${locale}/inventory/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  if (bypassAuth) {
    return NextResponse.next();
  }

  // If no refresh token and trying to access protected route, redirect to login
  if (!refreshToken) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they have their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\..*|api).*)",
  ],
};
