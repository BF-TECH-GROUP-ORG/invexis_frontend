"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";
import { useTranslations, useLocale } from "next-intl";

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
      router.push(`/${locale}/auth/otp-login/verify`);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a]">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
        <Image
          src="/images/8.png"
          alt="OTP Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
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