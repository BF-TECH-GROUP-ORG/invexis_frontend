"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuthSession } from "@/features/auth/authSlice";
import { CircularProgress } from "@mui/material";
import { useLocale } from "next-intl";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const locale = useLocale();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL query parameters
        // The backend should redirect here with tokens as query params
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const userStr = searchParams.get("user");

        if (!accessToken || !refreshToken || !userStr) {
          throw new Error("Missing authentication data");
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));

        // Set auth session
        dispatch(setAuthSession({ user, accessToken, refreshToken }));

        // Redirect to dashboard
        router.push(`/${locale}/inventory`);
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        // Redirect to login with error
        router.push(`/${locale}/auth/login?error=oauth_failed`);
      }
    };

    handleCallback();
  }, [searchParams, dispatch, router, locale]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-center">
        <CircularProgress />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
