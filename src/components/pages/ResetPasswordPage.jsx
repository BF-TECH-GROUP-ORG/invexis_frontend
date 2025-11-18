"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";
import { useTranslations, useLocale } from "next-intl";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.reset.reset");
  const tForm = useTranslations("form");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const { token } = params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-[#1a1a1a]">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
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
          title={`${t("title")} [key]`}
          desc={t("subtitle")}
          submitLabel={submitting ? t("resetting") : t("resetButton")}
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