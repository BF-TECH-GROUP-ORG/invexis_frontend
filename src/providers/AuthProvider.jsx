"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useLocale } from "next-intl";

export default function AuthProvider({ children }) {
  const { data: session } = useSession();
  const locale = useLocale();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.warn("[Auth] RefreshAccessTokenError detected on client session. Signing out...");
      signOut({ callbackUrl: `/${locale || "en"}/auth/login?expired=true` });
    }
  }, [session?.error, locale]);

  return <>{children}</>;
}

