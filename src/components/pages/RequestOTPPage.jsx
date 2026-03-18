"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";
import { useTranslations, useLocale } from "next-intl";

import { AuthService } from "@/services/AuthService";

export default function RequestOTPPage() {
  const t = useTranslations("auth.otp.request");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await AuthService.requestOtpLogin(identifier);
      if (response.ok) {
        router.push(`/${locale}/auth/otp-login/verify?identifier=${encodeURIComponent(identifier)}`);
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a]">
      <div className="hidden md:flex md:w-1/2 md:h-full items-center justify-center relative">
        <Image
          src="/images/login.jpg"
          alt="Login Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title={`${t("title")} [key]`}
          desc={t("subtitle")}
          onSubmit={handleSubmit}
          submitLabel={submitting ? t("sending") : t("sendButton")}
          fields={[
            {
              label: t("label"),
              type: "text",
              value: identifier,
              onChange: (e) => setIdentifier(e.target.value),
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
        />
      </div>
    </div>
  );
}