# Environment Configuration for Invexis Frontend

## API Configuration
Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_API_URL=https://granitic-jule-haunting.ngrok-free.dev
NEXT_PUBLIC_AUTH_API_URL=https://granitic-jule-haunting.ngrok-free.dev/api/auth
NEXT_PUBLIC_GOOGLE_AUTH_URL=https://granitic-jule-haunting.ngrok-free.dev/api/auth/google/signup
```

## Important Notes
- The `.env.local` file is gitignored for security
- After creating the file, restart the development server
- These URLs point to the ngrok tunnel for the backend API
