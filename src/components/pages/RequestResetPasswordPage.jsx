"use client";

import { useState } from "react";
import Image from "next/image";
import { HiChevronLeft, HiArrowRight } from "react-icons/hi";
import FormWrapper from "@/components/shared/FormWrapper";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function RequestResetPasswordPage() {
  const t = useTranslations("auth.reset.request");
  const tForm = useTranslations("form");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      setSuccess("Request sent successfully! Please check your email.");
      router.push(`/${locale}/auth/reset-password/reset`);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-[#1a1a1a]">
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-gray-50 relative">
        <Image
          src="/images/7.png"
          alt="Reset password in Invexis application"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[90%] px-4"
          priority
        />
      </div>
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title={t("title")}
          desc={t("subtitle")}
          submitLabel={submitting ? t("sending") : t("sendButton")}
          submitIcon={<HiArrowRight />}
          onSubmit={handleSubmit}
          fields={[
            {
              label: tForm("email"),
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              placeholder: "example@gmail.com",
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