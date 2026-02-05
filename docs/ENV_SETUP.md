# Environment Configuration for Invexis Frontend

## API Configuration
Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_API_URL=https://granitic-jule-haunting.ngrok-free.dev
NEXT_PUBLIC_AUTH_API_URL=https://granitic-jule-haunting.ngrok-free.dev/api/auth
# (Google OAuth removed from this project)
```

## Important Notes
- The `.env.local` file is gitignored for security
- After creating the file, restart the development server
- These URLs point to the ngrok tunnel for the backend API

## Development authentication bypass

For faster local development you can bypass the app's auth checks by setting an env var in `.env.local`:

```env
NEXT_PUBLIC_BYPASS_AUTH=true
```

When enabled the frontend will treat the session as authenticated with a small, non-persistent dev user. Only use this locally for development — do not enable this flag in production.

Runtime toggle (no restart required)

You can also toggle the bypass at runtime from any page using the small developer toggle in the app UI (bottom-right) which sets a runtime flag in localStorage:

```js
localStorage.setItem('DEV_BYPASS_AUTH', 'true')
// toggle off
localStorage.setItem('DEV_BYPASS_AUTH', 'false')
```

The UI toggle is only visible when running locally (NODE_ENV !== 'production').
