"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import TermsAndPrivacyPopup from "@/components/layouts/TermsAndPrivacyPopup";
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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  // Show popup before allowing checkbox tick
  const handleTermsClick = () => {
    if (!acceptTerms) setShowTermsPopup(true);
    else setAcceptTerms(false); // untick if already checked
  };

  const handleAgree = () => {
    setAcceptTerms(true);
    setShowTermsPopup(false);
  };

  const handleClosePopup = () => setShowTermsPopup(false);

  // Handle redirect if already authenticated (via bypass mode)
  useEffect(() => {
    const BYPASS =
      process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
      (typeof window !== "undefined" &&
        localStorage.getItem("DEV_BYPASS_AUTH") === "true");

    if (BYPASS) {
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") || `/${locale}/inventory`;
      router.replace(callbackUrl);
    }
  }, [router, locale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("You must accept the Terms & Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") || `/${locale}/inventory/dashboard`;

      // Use next-auth credentials provider
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });

      if (result?.error) {
        setError(result.error || "Login failed");
      } else {
        // Successful sign in — route to callbackUrl
        router.push(callbackUrl);
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-[#1a1a1a] overflow-hidden">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 md:h-full items-center justify-center bg-orange-100 relative">
        <Image
          src="/images/8.png"
          alt="Login Illustration"
          width={600}
          height={600}
          className="object-contain md:max-h-[40%] px-4"
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
            extraLinks={[
              {
                href: `/${locale}/auth/signup`,
                label: t("signup.noAccount"),
              },
            ]}
            showTerms={true}
            acceptedTerms={acceptTerms}
            onAcceptTerms={handleTermsClick}
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

      {/* Terms & Privacy Popup */}
      <TermsAndPrivacyPopup
        open={showTermsPopup}
        onAgree={handleAgree}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default LoginPage;
