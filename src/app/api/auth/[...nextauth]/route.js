import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

// Log the API Base on startup for debugging
if (process.env.NODE_ENV === "development") {
  console.log(`[NextAuth] Using API_BASE for Auth: ${API_BASE}`);
}

async function refreshAccessToken(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: token.cookies || "",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
    const setCookie = res.headers.get("set-cookie");

    return {
      ...token,
      accessToken: data.accessToken,
      user: data.user || token.user,
      accessTokenExpires:
        Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 15 * 60 * 1000),
      cookies: setCookie || token.cookies,
      error: null,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // allow client to re-seed a session after profile updates
        // client may call signIn('credentials', { redirect:false, seedUser: JSON.stringify(user), accessToken })
        if (credentials?.seedUser) {
          try {
            const userPayload =
              typeof credentials.seedUser === "string"
                ? JSON.parse(credentials.seedUser)
                : credentials.seedUser;
            const accessToken =
              credentials.accessToken || userPayload?.accessToken || null;

            return {
              id: userPayload._id ?? userPayload.id ?? userPayload.username,
              name:
                `${userPayload.firstName ?? ""} ${
                  userPayload.lastName ?? ""
                }`.trim() ||
                userPayload.username ||
                userPayload.email,
              email: userPayload.email,
              role: userPayload.role,
              accessToken,
              user: userPayload,
              cookies: "",
            };
          } catch (err) {
            throw new Error("Invalid seedUser payload");
          }
        }
        try {
          const loginUrl = `${API_BASE}/auth/login`;
          if (process.env.NODE_ENV === "development") {
            console.log(`[NextAuth] Authorizing: ${loginUrl}`, {
              identifier: credentials.identifier,
            });
          }

          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          const data = await res.json().catch(() => ({}));

          if (process.env.NODE_ENV === "development") {
            console.log(`[NextAuth] Backend Response Status: ${res.status}`);
          }

          if (
            !res.ok ||
            data.ok === false ||
            (!data.user && !data.accessToken)
          ) {
            const errorMessage =
              data.message ||
              data.error ||
              "Invalid credentials or backend error";
            if (process.env.NODE_ENV === "development") {
              console.error(`[NextAuth] Auth failed:`, errorMessage);
            }
            throw new Error(errorMessage);
          }

          const { accessToken, user } = data;
          const setCookie = res.headers.get("set-cookie");

          return {
            id: user._id ?? user.id ?? user.username,
            name:
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
              user.username ||
              user.email,
            email: user.email,
            role: user.role,
            accessToken: accessToken || data.token,
            user,
            cookies: setCookie,
          };
        } catch (e) {
          console.error("[NextAuth] Authorize Error:", e.message);
          throw new Error(e.message || "Login failed");
        }
      },
    }),
    // No external OAuth providers enabled (Google removed)
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in with credentials
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          user: user.user || {
            email: user.email,
            name: user.name,
            role: user.role,
          },
          cookies: user.cookies,
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
        };
      }

      // For non-Credentials providers we fall back to refresh handling below

      // Token still valid
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expired - refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user || session.user;
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
  },
  secret: process.env.NEXTAUTH_SECRET || "changeme",
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
