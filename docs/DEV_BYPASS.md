# Development authentication bypass

This project supports a local development-only bypass for authentication so you can work on UI and flows without logging in.

How to enable:
1. Open `.env.local` in the project root (create it if it doesn't exist).
2. Add the following line and restart the dev server:

```env
NEXT_PUBLIC_BYPASS_AUTH=true
```

What this does:
- Populates a lightweight dev user session in the Redux store (role: `admin`).
- Client-side route guards will allow access without a real token.
- The HTTP client (`src/lib/axios.js`) will not auto-redirect to `/auth/login` for refresh problems while bypass is enabled.

Runtime toggle

You can also toggle the bypass at runtime using the in-app toggle (bottom-right) which stores a runtime flag in localStorage under the key `DEV_BYPASS_AUTH`.

```js
// enable
localStorage.setItem('DEV_BYPASS_AUTH', 'true')
// disable
localStorage.setItem('DEV_BYPASS_AUTH', 'false')
```

When enabled the app will set a minimal dev user session in Redux so components that read `user` will work.

Important notes:
- This flag is for local development only — never enable it in production.
- To revert: remove the env var or set it to `false` and restart the dev server.
- If you used the app earlier and tokens are stored in localStorage, you may need to clear localStorage to return to a clean state.
