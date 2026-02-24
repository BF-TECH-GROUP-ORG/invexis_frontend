import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const publicPages = [
    "/",
    "/auth/login",
    "/welcome",
    "/errors/*"
];

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // 1. Determine if the page is public
    const publicPathnameRegex = RegExp(
        `^(/(${routing.locales.join("|")}))?(${publicPages
            .flatMap((p) => (p === "/" ? ["", "/"] : p))
            .join("|")})/?$`,
        "i"
    );
    const isPublicPage = publicPathnameRegex.test(pathname);

    // 2. Identify current locale for redirects
    const pathnameParts = pathname.split("/");
    const locale = routing.locales.includes(pathnameParts[1]) ? pathnameParts[1] : routing.defaultLocale;

    // 3. Already Logged In -> Redirect away from Login/Signup
    const isAuthPage = pathname.includes("/auth/login") || pathname.includes("/auth/signup");
    if (isAuthPage && token) {
        // Respect callbackUrl if it exists, otherwise go to dashboard
        const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
        if (callbackUrl) {
            return NextResponse.redirect(new URL(callbackUrl, req.url));
        }
        return NextResponse.redirect(new URL(`/${locale}/inventory/dashboard`, req.url));
    }

    // 4. Not Logged In -> Redirect to Login (unless public)
    if (!isPublicPage && !token) {
        const loginUrl = new URL(`/${locale}/auth/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 5. Otherwise, let intl handle it
    return intlMiddleware(req);
}

export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
