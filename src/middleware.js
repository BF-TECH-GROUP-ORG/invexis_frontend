import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/otp-login",
  "/auth/google-callback",
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Extract locale
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "en";
    const pathWithoutLocale = localeMatch
      ? pathname.slice(locale.length + 1) || "/"
      : pathname;

    const isPublicPath = PUBLIC_PATHS.some((p) =>
      pathWithoutLocale.startsWith(p)
    );
    const isAuthPath = pathWithoutLocale.startsWith("/auth/");

    // 1. If user is authenticated and tries to access public auth pages (login/signup), redirect to dashboard
    if (token && isAuthPath) {
      return NextResponse.redirect(
        new URL(`/${locale}/inventory/dashboard`, req.url)
      );
    }

    // 2. If user is authenticated and on root "/", redirect to dashboard
    if (token && pathWithoutLocale === "/") {
      return NextResponse.redirect(
        new URL(`/${locale}/inventory/dashboard`, req.url)
      );
    }

    // 3. If user is NOT authenticated and path is NOT public, redirect to localized login
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
    if (!token && !isPublicPath && !bypassAuth) {
      const loginUrl = new URL(`/${locale}/auth/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // 4. RBAC: Protect admin-only routes (centralized list — edit this to add/remove admin paths)
    const ADMIN_ONLY_PATHS = [
      
      // add more admin-only prefixes here when needed
    ];

    if (ADMIN_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
      const userRole = token?.user?.role;
      if (userRole !== "super_admin" && userRole !== "admin") {
        return NextResponse.redirect(
          new URL(`/${locale}/unauthorized`, req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // We handle redirection manually in the middleware function to support dynamic locales
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*|api).*)"],
};
