"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";
import { useTranslations, useLocale } from "next-intl";
import { AuthService } from "@/services/AuthService";

function ResetPasswordContent() {
  const t = useTranslations("auth.reset.reset");
  const tForm = useTranslations("form");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("errorPasswordsDoNotMatch") || "Passwords do not match");
      return;
    }
    if (!token) {
      setError(t("errorInvalidToken") || "Invalid or missing token");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await AuthService.confirmPasswordReset(token, password);
      if (response.ok) {
        setSuccess(t("successMessage") || "Password reset successfully!");
        setTimeout(() => {
          router.push(`/${locale}/auth/login`);
        }, 2000);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a]">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100 dark:bg-zinc-800">
        <Image
          src="/images/reset-password.png"
          alt="Reset Password Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title={`${t("title")}`}
          desc={t("subtitle")}
          submitLabel={submitting ? t("resetting") : t("resetButton")}
          onSubmit={handleSubmit}
          isLoading={submitting}
          fields={[
            {
              label: t("newPassword"),
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
            },
            {
              label: t("confirmNewPassword"),
              type: "password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              required: true,
            },
          ]}
          extraLinks={[
            {
              href: `/${locale}/auth/login`,
              icon: <HiChevronLeft />,
              label: tAuth("returnToLogin"),
            },
          ]}
          error={error}
          success={success}
        />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}