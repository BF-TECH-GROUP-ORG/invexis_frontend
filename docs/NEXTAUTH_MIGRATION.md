Summary
=======
This project was migrated from a custom client-side auth to NextAuth.js (JWT strategy) with CredentialsProvider.

Key points
----------
-- Authentication is now handled by NextAuth (App Router): src/app/api/auth/[...nextauth]/route.js.
- CredentialsProvider calls your backend: POST {API_BASE}/auth/login using credentials (identifier + password).
- JWT callback in NextAuth now automatically calls backend {API_BASE}/auth/refresh (forwarding cookies) when the access token expires.
- The NextAuth session object includes:
  - session.accessToken (the backend access token)
  - session.user (full user object returned from the backend)
  - session.expires (expiration time for client side)

What I changed
--------------
-- Added NextAuth API route: src/app/api/auth/[...nextauth]/route.js (CredentialsProvider + refresh logic)
- Wrapped app with NextAuth's <SessionProvider> (src/providers/ClientProviders.jsx)
- Login form now uses signIn('credentials') (src/components/forms/LoginForm.jsx)
- Replaced localStorage/Redux token usage with NextAuth session usage across the app
  - Updated axios instances to attach access token from NextAuth session on the client (src/lib/axios.js, src/utils/axiosClient.js)
  - The response interceptors attempt a single session re-check and will signOut/redirect if refresh fails
- Middleware (src/middleware.js) now uses next-auth getToken() to protect routes and perform RBAC (admin checks for /admin and /inventory/admin paths)
 - Middleware (src/middleware.js) now uses next-auth getToken() to protect routes and perform RBAC. Admin-only routes are centralized in the `ADMIN_ONLY_PATHS` array near the top of the file — add any admin-only prefixes there.
- ProtectedRoute (src/lib/ProtectedRoute.jsx) now uses useSession() (NextAuth) instead of Redux
- Hooks (src/hooks/useAuth.jsx) now use useSession() from NextAuth
- Removed storing of access/refresh tokens in localStorage and made authUtils token functions no-ops (tokens are managed by NextAuth)

Developer notes & environment
-----------------------------
Required environment variables:
- NEXT_PUBLIC_API_URL => e.g. https://api.myapp.com
- NEXTAUTH_SECRET => strong random secret
- NEXT_PUBLIC_BYPASS_AUTH (optional dev flag to allow bypass behavior)

How refresh works
-----------------
- On initial login NextAuth stores the accessToken in the JWT (in the token object) and the backend should set / manage the refresh token as an HttpOnly cookie.
- When NextAuth jwt callback finds the access token expired, it will call your backend /auth/refresh (forwarding cookies) and update the token.
- If refresh fails, NextAuth will set an error on the token and session; frontend code (axios interceptors, ProtectedRoute, middleware) will redirect to login.
 - If refresh fails, NextAuth will set an error on the token and session; frontend code (axios interceptors, ProtectedRoute, middleware) will redirect to a localized login page (routes now include the locale prefix, e.g., `/en/auth/login`).

Next steps / remaining items
 You might want to remove the old Redux auth slice entirely once you are fully migrated — for backward compatibility we kept a minimal stub in the code but tokens are no longer stored in Redux.
 Convert OAuth flows to native NextAuth providers when needed — this codebase currently uses the Credentials provider only.

Manual test route added
-----------------------
A small test API endpoint is available at /api/auth/test (implemented in src/app/api/auth/test/route.js) which returns the current NextAuth JWT token for debugging when authenticated.

Important: the Pages Router handlers were removed to avoid conflicts: all NextAuth handlers now live under the App Router (`src/app/api/auth/[...nextauth]/route.js` and `src/app/api/auth/test/route.js`). The `pages/` folder was removed as part of the migration so the project only uses the App Router for API routes.

Quick manual checks
-------------------
1. Start dev server.
2. Visit /en/auth/login and sign in with credentials. If successful you'll be redirected to /en/inventory (or the callbackUrl you used).
3. Curl the test endpoint to inspect the token (it will return 401 if not authenticated):

```bash
curl -i -X GET http://localhost:3000/api/auth/test --cookie "your-next-auth-cookie-here"
```

4. Try signing out and verify you are redirected to the login page and /api/auth/test returns 401.

If you'd like, I can now:
- Finish swapping any remaining components to use NextAuth session everywhere and remove the auth Redux slice completely.
- Add server-side helpers to append the accessToken for server-side fetch/getServerSideProps.
- Add tests and deployment checks.


