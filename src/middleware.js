import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const publicPages = [
    "/",
    "/auth/login",
    "/auth/signup",
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

    // 3. Get token (Vercel compatibility)
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production"
    });

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
        return NextResponse.redirect(new URL(`/${locale}/inventory/dashboard`, req.url));
    }

    // 5. Not Logged In -> Redirect to Login (unless public)
    if (!isPublicPage && !token) {
        // Prevent setting auth pages as callbackUrl
        const callback = isAuthPage ? `/${locale}/inventory/dashboard` : pathname;
        const loginUrl = new URL(`/${locale}/auth/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", callback);
        return NextResponse.redirect(loginUrl);
    }

    // 6. Otherwise, let intl handle it
    return intlMiddleware(req);
}

export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
