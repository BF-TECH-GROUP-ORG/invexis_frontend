"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CircularProgress } from "@mui/material";
import { useLocale } from "next-intl";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // This route used to accept backend OAuth redirects - after migrating to NextAuth
    // we can start the NextAuth Google sign-in flow directly here so old redirect
    // locations continue to work.
    const startSignIn = async () => {
      try {
        await signIn("google", { callbackUrl: `/${locale}/inventory` });
      } catch (e) {
        console.error("Failed to start google sign in", e);
        router.push(`/${locale}/auth/login?error=oauth_failed`);
      }
    };

    startSignIn();
  }, [router, locale]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-center">
        <CircularProgress />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
