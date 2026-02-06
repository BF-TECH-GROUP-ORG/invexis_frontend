"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import useAuth from "@/hooks/useAuth";
import { useLoading } from "@/contexts/LoadingContext";
import FormWrapper from "../shared/FormWrapper";
import { selectTheme } from "@/features/settings/settingsSlice";

const LoginPage = () => {
  // keep redux user/theme selectors — auth will come from NextAuth now
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const tForm = useTranslations("form");
  const theme = useSelector(selectTheme); // Get theme from Redux

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { setLoading, setLoadingText } = useLoading();

  // Handle redirect if already authenticated
  const { status } = useAuth();

  // Track if we're handling a form submission to prevent duplicate redirects
  const isFormSubmitting = useRef(false);

  useEffect(() => {
    const BYPASS =
      process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
      (typeof window !== "undefined" &&
        localStorage.getItem("DEV_BYPASS_AUTH") === "true");

    // Only auto-redirect if already authenticated AND not in the middle of form submission
    if ((BYPASS || status === "authenticated") && !isFormSubmitting.current) {
      const params = new URLSearchParams(window.location.search);
      let callbackUrl = params.get("callbackUrl") || "/inventory/dashboard";

      // Sanitize absolute URLs to relative
      try {
        const urlObj = new URL(callbackUrl, window.location.origin);
        if (urlObj.origin === window.location.origin) {
          callbackUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch (e) {
        // Fallback if URL is invalid
      }

      // Remove locale prefix if present (e.g., /en/path -> /path)
      // next-intl's router.replace will re-add the current locale automatically
      const localePrefixRegex = /^\/(en|fr|rw|sw)(\/|$)/;
      const sanitizedPath = callbackUrl.replace(localePrefixRegex, "/");

      router.replace(sanitizedPath);
      // Don't activate loader - let the natural navigation handle it
    }
  }, [router, locale, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setSubmitting(true);
    // Mark that we're handling a form submission to prevent useEffect from redirecting
    isFormSubmitting.current = true;

    try {
      const params = new URLSearchParams(window.location.search);
      let callbackUrl = params.get("callbackUrl") || "/inventory/dashboard";

      // Sanitize absolute URLs to relative
      try {
        const urlObj = new URL(callbackUrl, window.location.origin);
        if (urlObj.origin === window.location.origin) {
          callbackUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch (e) { }

      const localePrefixRegex = /^\/(en|fr|rw|sw)(\/|$)/;
      const sanitizedPath = callbackUrl.replace(localePrefixRegex, "/");

      // Use next-auth credentials provider
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });

      if (result?.error) {
        setError(result.error || "Login failed");
        setSubmitting(false);
        // Reset flag on error to allow retry
        isFormSubmitting.current = false;
      } else {
        // Successful sign in — route to callbackUrl
        // Don't activate global loader - let the top progress bar handle navigation
        router.push(sanitizedPath);

        // Clean up the URL by removing the callbackUrl query parameter
        // This prevents the callback URL from appearing in production
        setTimeout(() => {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }, 100);
      }
    } catch (err) {
      setError(err?.message || "Login failed");
      setSubmitting(false);
      // Reset flag on error to allow retry
      isFormSubmitting.current = false;
    } finally {
      // Don't setSubmitting(false) here if successful, to avoid flicker
    }
  };

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-[#1a1a1a] overflow-hidden">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 md:h-full items-center justify-center relative">
        <Image
          src="/images/login.jpg"
          alt="Login Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center sm:p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <FormWrapper
            title={t("login.title")}
            desc={t("login.subtitle")}
            onSubmit={handleSubmit}
            submitLabel={submitting ? "Signing In..." : t("loginButton")}
            submitIcon={<HiArrowRight />}
            isLoading={submitting}
            error={error}
            oauthOptions={["otp"]}
            fields={[
              {
                label: tForm("email"),
                type: "text",
                value: identifier,
                onChange: (e) => setIdentifier(e.target.value),
                required: true,
              },
              {
                label: tForm("password"),
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                before: (
                  <div className="flex justify-end -mb-2">
                    <Link
                      href={`/${locale}/auth/reset-password/request`}
                      className="text-sm text-blue-600 hover:underline font-metropolis"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                ),
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <HiEyeOff /> : <HiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
