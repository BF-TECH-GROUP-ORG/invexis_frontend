"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { CircularProgress } from "@mui/material";

function CallbackHandler() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const accessToken = searchParams.get("access_token");
      const userStr = searchParams.get("user");
      const subscriptionStr = searchParams.get("subscription");
      const error = searchParams.get("error");

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        router.push(`/${locale}/auth/login`);
        return;
      }

      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          const subscription = subscriptionStr ? JSON.parse(subscriptionStr) : null;

          // 🛡️ CRITICAL: SEED NEXT-AUTH SESSION
          const result = await signIn("credentials", {
            redirect: false,
            seedUser: userStr,
            accessToken: accessToken,
          });

          if (result?.error) {
            console.error("NextAuth seed error:", result.error);
            toast.error("Failed to initialize session.");
            router.push(`/${locale}/auth/login`);
            return;
          }

          // Store supplemental data
          if (subscription) {
            localStorage.setItem("subscription_status", JSON.stringify(subscription));
          }

          toast.success("Welcome back!");

          // Redirect to dashboard or profile completion
          if (user.requiresProfileCompletion) {
            router.push(`/${locale}/welcome`);
          } else {
            router.push(`/${locale}/inventory/dashboard`);
          }
        } catch (e) {
          console.error("Error parsing auth data:", e);
          toast.error("Failed to process login data.");
          router.push(`/${locale}/auth/login`);
        }
      }
    };

    handleAuth();
  }, [searchParams, router, locale]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
      <CircularProgress size={48} className="text-blue-600 mb-4" />
      <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">
        Finalizing your secure sign-in...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
            <CircularProgress />
        </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
