import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const publicPages = [
    "/",
    "/auth/login",
    // Add other public pages here if needed
    "/welcome",
    "/errors/*"
];

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
    // Note: If you need to add custom logic here, you can.
    // Currently, `withAuth` handles the redirect to sign-in page automatically
    // if the user is not authenticated and tries to access a protected route.
    function onSuccess(req) {
        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ token }) => token != null,
        },
        pages: {
            signIn: "/auth/login",
        },
        secret: process.env.NEXTAUTH_SECRET,
    }
);


export default function middleware(req) {
    const publicPathnameRegex = RegExp(
        `^(/(${routing.locales.join("|")}))?(${publicPages
            .flatMap((p) => (p === "/" ? ["", "/"] : p))
            .join("|")})/?$`,
        "i"
    );

    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

    if (isPublicPage) {
        return intlMiddleware(req);
    } else {
        return authMiddleware(req);
    }
}

export const config = {
    // Skip all paths that should not be internationalized
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
