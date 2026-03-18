import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const publicPages = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/callback",
    "/auth/verify-email",
    "/auth/reset-password/*",
    "/auth/otp-login/*",
    "/welcome",
    "/errors/*"
];

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req) {
    const { pathname } = req.nextUrl;

    // 1. Normalize pathname (remove locale prefix for check)
    // e.g., /en/auth/login -> /auth/login
    let normalizedPath = pathname;
    const pathParts = pathname.split("/").filter(Boolean);
    const locale = routing.locales.includes(pathParts[0]) ? pathParts[0] : routing.defaultLocale;

    if (routing.locales.includes(pathParts[0])) {
        normalizedPath = "/" + pathParts.slice(1).join("/");
    }
    if (normalizedPath === "") normalizedPath = "/";

    // 2. Identify if it's a public page
    const isPublicPage = publicPages.some(page => {
        if (page.endsWith("/*")) {
            return normalizedPath.startsWith(page.slice(0, -1));
        }
        return normalizedPath === page;
    });

    // 3. Get token (iOS/Safari fix: robust HTTPS detection)
    const isHttps =
        req.headers.get("x-forwarded-proto") === "https" ||
        req.nextUrl.protocol === "https:" ||
        process.env.NODE_ENV === "production";

    let token = null;
    try {
        token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: isHttps,
        });
    } catch (error) {
        console.error("[Middleware] getToken error:", error);
    }

    // 4. Already Logged In -> Redirect away from Auth Pages
    const isAuthPage = normalizedPath.includes("/auth/login") || normalizedPath.includes("/auth/signup");
    if (isAuthPage && token) {
        let callbackUrl = req.nextUrl.searchParams.get("callbackUrl");

        // Prevent redirecting loops back to auth pages
        if (callbackUrl && (callbackUrl.includes("/auth/login") || callbackUrl.includes("/auth/signup"))) {
            callbackUrl = null;
        }

        if (callbackUrl) {
            return NextResponse.redirect(new URL(callbackUrl, req.url));
        }

        // Sales Department Redirection
        const depts = token?.user?.assignedDepartments || [];
        const isSalesOnly = depts.includes("sales") && token?.user?.role !== "company_admin";
        const defaultPath = isSalesOnly ? "/inventory/sales/history" : "/inventory/dashboard";

        return NextResponse.redirect(new URL(`/${locale}${defaultPath}`, req.url));
    }

    // 5. Not Logged In -> Redirect to Login (unless public)
    if (!isPublicPage && !token) {
        // Prevent setting auth pages as callbackUrl
        const callback = isAuthPage ? `/inventory/dashboard` : normalizedPath;
        const loginUrl = new URL(`/${locale}/auth/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", callback);
        return NextResponse.redirect(loginUrl);
    }

    // 6. Route Guard for Sales Department
    if (token && normalizedPath.startsWith("/inventory")) {
        const depts = token?.user?.assignedDepartments || [];
        const isSalesOnly = depts.includes("sales") && token?.user?.role !== "company_admin";

        if (isSalesOnly) {
            const allowedSalesPaths = [
                "/inventory/notifications",
                "/inventory/sales",
                "/inventory/debts",
            ];

            const isAllowed = allowedSalesPaths.some(path => normalizedPath.startsWith(path));

            if (!isAllowed) {
                // If trying to access unauthorized inventory route, redirect to sales history
                return NextResponse.redirect(new URL(`/${locale}/inventory/sales/history`, req.url));
            }
        }
    }

    // 7. Otherwise, let intl handle it
    return intlMiddleware(req);
}

export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
