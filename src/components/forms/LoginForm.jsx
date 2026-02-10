"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import { selectTheme } from "@/features/settings/settingsSlice";

const LoginPage = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const tForm = useTranslations("form");
  const theme = useSelector(selectTheme);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setSubmitting(false);
      } else {
        // Successful login
        // Middleware will handle redirecting if user tries to visit login page again
        // Here we just push to dashboard
        router.push("/inventory/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
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
            submitIcon={!submitting && <HiArrowRight />}
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
