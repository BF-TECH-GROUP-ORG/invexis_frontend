"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import PinInput from "@/components/shared/PinInput";
import { HiChevronLeft } from "react-icons/hi";
import { useTranslations, useLocale } from "next-intl";
import { AuthService } from "@/services/AuthService";
import { signIn } from "next-auth/react";

function VerifyOTPContent() {
  const t = useTranslations("auth.otp.verify");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otp, setOtp] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill from query parameters
  useEffect(() => {
    const otpParam = searchParams.get("otp");
    const identifierParam = searchParams.get("identifier") || searchParams.get("email");
    
    if (otpParam) setOtp(otpParam);
    if (identifierParam) setIdentifier(identifierParam);

    // Auto-submit if both are present
    if (otpParam && identifierParam) {
      handleVerify(otpParam, identifierParam);
    }
  }, [searchParams]);

  const handleVerify = async (otpToVerify, identifierToVerify) => {
    const finalOtp = otpToVerify || otp;
    const finalIdentifier = identifierToVerify || identifier;

    if (!finalOtp || finalOtp.length !== 6) {
      setError(t("errorInvalidOtp"));
      return;
    }
    if (!finalIdentifier) {
      setError(t("errorIdentifierRequired"));
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await AuthService.verifyOtpLogin(finalIdentifier, finalOtp);
      
      if (response.ok && response.user) {
        // Sign in to NextAuth using the pre-seeded session pattern
        const result = await signIn("credentials", {
          seedUser: JSON.stringify(response.user),
          accessToken: response.accessToken,
          redirect: false,
        });

        if (result.error) {
          setError(result.error);
        } else {
          // Success! Redirect to home or dashboard
          window.location.href = `/${locale}/inventory/dashboard`;
        }
      } else {
        setError(response.message || t("errorVerificationFailed"));
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || t("errorUnexpected"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    handleVerify();
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
          title={`${t("title")}`}
          desc={t("subtitle")}
          onSubmit={handleSubmit}
          submitLabel={submitting ? t("verifying") : t("verifyButton")}
          fields={[
            {
              label: t("identifierLabel") || "Email / Phone Number",
              type: "text",
              value: identifier,
              onChange: (e) => setIdentifier(e.target.value),
              required: true,
              disabled: !!searchParams.get("identifier") || !!searchParams.get("email"),
            },
            {
              label: t("label"),
              type: "custom",
              required: true,
              render: () => (
                <PinInput
                  value={otp}
                  onChange={(val) => setOtp(val)}
                  disabled={submitting}
                />
              ),
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
          isLoading={submitting}
        />
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}