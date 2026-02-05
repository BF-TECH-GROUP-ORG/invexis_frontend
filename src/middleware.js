import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getAllowedRolesForPath } from "./lib/rbac";

// OPTIMIZATION: Use a Map for O(1) lookup instead of regex matching
// Pre-compile regex patterns to avoid recompilation on each request
const PUBLIC_PATH_PATTERNS = [
  /^\/$/, // Root path "/"
  /^\/welcome/, // Welcome pages
  /^\/auth\//, // All auth pages
  /^\/errors\//, // Error pages
  /^\/not-found$/, // 404 page
  /^\/unauthorized$/, // Unauthorized page
];

// Cache for locale extraction to avoid repeated parsing
const localeCache = new Map();

// OPTIMIZATION: Memoize locale extraction to reduce regex parsing on every request
function extractLocale(pathname) {
  // Quick cache lookup first (improves performance for repeated paths)
  if (localeCache.has(pathname)) {
    return localeCache.get(pathname);
  }

  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en";
  const pathWithoutLocale = localeMatch
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;

  const result = { locale, pathWithoutLocale };
  
  // Cache result for future requests (limit cache to prevent memory leak)
  if (localeCache.size > 1000) {
    const firstKey = localeCache.keys().next().value;
    localeCache.delete(firstKey);
  }
  localeCache.set(pathname, result);

  return result;
}

// Helper function to check if a path matches any public pattern
function isPublicPath(pathWithoutLocale) {
  return PUBLIC_PATH_PATTERNS.some((pattern) =>
    pattern.test(pathWithoutLocale)
  );
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // OPTIMIZATION: Use memoized locale extraction
    const { locale, pathWithoutLocale } = extractLocale(pathname);

    const isPublic = isPublicPath(pathWithoutLocale);
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
    if (!token && !isPublic && !bypassAuth) {
      const loginUrl = new URL(`/${locale}/auth/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // 4. RBAC check — central mapping drives allowed roles for given path prefixes
    const allowed = getAllowedRolesForPath(pathWithoutLocale);
    if (allowed) {
      const userRole = token?.user?.role;
      const assignedDepartments = token?.user?.assignedDepartments || [];

      // company_admins always have full admin-like access, allow them
      const isCompanyAdmin = userRole === "company_admin";
      const hasAllowedRole = allowed.roles.includes(userRole);
      const hasAllowedDepartment = assignedDepartments.some((dept) =>
        allowed.departments.includes(dept)
      );

      if (!isCompanyAdmin && !hasAllowedRole && !hasAllowedDepartment) {
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
