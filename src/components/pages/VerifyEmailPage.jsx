"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";
import { useTranslations, useLocale } from "next-intl";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [submitting, setSubmitting] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
        <Image
          src="/images/verify-email.png"
          alt="Verify Email Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title={`${t("title")} [email]`}
          desc={t("subtitle")}
          onSubmit={(e) => e.preventDefault()}
          submitLabel={t("verifying")}
          fields={[]}
          extraLinks={[
            {
              href: `/${locale}/auth/login`,
              icon: <HiChevronLeft />,
              label: tAuth("returnToLogin"),
            },
          ]}
          error={error}
          success={success}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}