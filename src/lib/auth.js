/**
 * NextAuth Configuration
 * Handles authentication strategies including credentials login, OTP, token refresh, and session management
 */

import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Get the API base URL from environment variables
 * Handles conversion from WebSocket URLs to HTTP URLs if needed
 * @returns {string} The API base URL
 */
const getApiBase = () => {
    // Prioritize the standard HTTP API URL
    let url =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_URL_SW ||
        "http://localhost:5000";

    // Safety: If for some reason we got a WebSocket URL (wss:// or ws://), convert it to HTTP for fetch
    if (url.startsWith("wss://")) {
        return url.replace("wss://", "https://");
    }
    if (url.startsWith("ws://")) {
        return url.replace("ws://", "http://");
    }
    return url;
};

const API_BASE = getApiBase();

/**
 * Robust refresh token strategy.
 * Attempts to refresh the access token using the refresh endpoint
 * @param {object} token - The JWT token object
 * @returns {Promise<object>} Updated token object with new access token or error
 */
async function refreshAccessToken(token) {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: token.cookies || "",
            },
        });

        if (!res.ok) {
            console.error(`[Auth] Refresh failed with status: ${res.status}`);
            throw new Error("Failed to refresh token");
        }

        const data = await res.json();
        const setCookie = res.headers.get("set-cookie");

        return {
            ...token,
            accessToken: data.accessToken,
            user: data.user || token.user,
            accessTokenExpires: Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 15 * 60 * 1000),
            cookies: setCookie || token.cookies,
            error: null,
        };
    } catch (error) {
        console.error("[Auth] RefreshAccessTokenError", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

/**
 * NextAuth configuration options
 * @type {import("next-auth").NextAuthOptions}
 */
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            /**
             * Authorize user credentials
             * Supports both pre-seeded sessions and standard login
             * @param {object} credentials - User credentials
             * @returns {Promise<object|null>} User object or null
             */
            async authorize(credentials) {
                // 1. Check for Pre-Seeded Session
                if (credentials?.seedUser) {
                    try {
                        const userPayload = typeof credentials.seedUser === "string"
                            ? JSON.parse(credentials.seedUser)
                            : credentials.seedUser;

                        const accessToken = credentials.accessToken || userPayload?.accessToken;

                        if (!accessToken) throw new Error("Missing access token in seed");

                        return {
                            id: userPayload._id ?? userPayload.id ?? userPayload.username,
                            name: `${userPayload.firstName ?? ""} ${userPayload.lastName ?? ""}`.trim() || userPayload.username,
                            email: userPayload.email,
                            role: userPayload.role,
                            accessToken,
                            user: userPayload,
                            cookies: "",
                            image: null
                        };
                    } catch (err) {
                        console.error("[Auth] Invalid seedUser payload:", err);
                        throw new Error("Invalid seedUser payload");
                    }
                }

                // 2. Standard Login
                try {
                    const loginUrl = `${API_BASE}/auth/login`;

                    const res = await fetch(loginUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            identifier: credentials.identifier,
                            password: credentials.password,
                        }),
                    });

                    const data = await res.json().catch(() => ({}));

                    if (!res.ok || data.ok === false || (!data.user && !data.accessToken)) {
                        const errorMessage = data.message || data.error || "Invalid credentials or backend error";
                        throw new Error(errorMessage);
                    }

                    const { accessToken, user } = data;

                    // 3. RBAC Check at the Gate
                    const restrictedRoles = ["customer", "super_admin", "super-admin", "super admin"];
                    if (restrictedRoles.includes(user.role?.toLowerCase())) {
                        throw new Error("Access denied: Your role does not have permission to login here.");
                    }

                    const setCookie = res.headers.get("set-cookie");

                    return {
                        id: user._id ?? user.id ?? user.username,
                        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || user.email,
                        email: user.email,
                        accessToken: accessToken || data.token,
                        user,
                        cookies: setCookie,
                        role: user.role,
                    };
                } catch (e) {
                    console.error("[Auth] Authorize Error:", e.message);
                    throw new Error(e.message || "Login failed");
                }
            },
        }),
    ],
    callbacks: {
        /**
         * JWT callback - handles token creation and refresh
         * @param {object} params - Callback parameters
         * @param {object} params.token - The JWT token
         * @param {object} params.user - The user object (only on sign in)
         * @param {object} params.account - The account object (only on sign in)
         * @returns {Promise<object>} Updated token
         */
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    user: user.user,
                    cookies: user.cookies,
                    accessTokenExpires: Date.now() + 15 * 60 * 1000,
                };
            }

            // Return previous token if the access token has not expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to refresh it
            return refreshAccessToken(token);
        },
        /**
         * Session callback - populates the session object sent to the client
         * @param {object} params - Callback parameters
         * @param {object} params.session - The session object
         * @param {object} params.token - The JWT token
         * @returns {Promise<object>} Updated session
         */
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.user = token.user;
            session.error = token.error;
            session.expires = token.accessTokenExpires
                ? new Date(token.accessTokenExpires).toISOString()
                : session.expires;

            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/login",
        error: "/auth/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};
