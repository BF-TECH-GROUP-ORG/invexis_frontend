import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

const handler = NextAuth({
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
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok || !data || !data.ok) {
            throw new Error(data.message || "Invalid credentials");
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
            accessToken,
            user,
            cookies: setCookie,
          };
        } catch (e) {
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
});

export { handler as GET, handler as POST };
