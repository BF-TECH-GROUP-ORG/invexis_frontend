"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import AuthService from "@/services/AuthService";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import TermsAndPrivacyPopup from "@/components/layouts/TermsAndPrivacyPopup";

export default function SignUp() {
  const router = useRouter();
  const t = useTranslations("auth"); // Assuming auth translations exist
  const tForm = useTranslations("form"); // Assuming form translations exist

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTermsClick = () => {
    if (!acceptTerms) setShowTermsPopup(true);
    else setAcceptTerms(false);
  };

  const handleAgree = () => {
    setAcceptTerms(true);
    setShowTermsPopup(false);
  };

  const handleClosePopup = () => setShowTermsPopup(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("You must accept the Terms & Privacy Policy to continue.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await AuthService.register(formData);
      // Redirect to login on success
      router.push("/auth/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-[#1a1a1a]">
      {/* Left Side - Image */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-orange-100 relative">
        <Image
          src="/images/8.png"
          alt="Sign Up Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[40%] px-4"
          priority
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Create Account"
          desc="Sign up to get started"
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Creating Account..." : "Sign Up"}
          submitIcon={<HiArrowRight />}
          isLoading={submitting}
          error={error}
          extraLinks={[
            {
              href: "/auth/login",
              label: "Already have an account? Login",
            },
          ]}
          showTerms={true}
          acceptedTerms={acceptTerms}
          onAcceptTerms={handleTermsClick}
          fields={[
            {
              label: "First Name",
              type: "text",
              value: formData.firstName,
              onChange: (e) => handleChange("firstName", e.target.value),
              required: true,
            },
            {
              label: "Last Name",
              type: "text",
              value: formData.lastName,
              onChange: (e) => handleChange("lastName", e.target.value),
              required: true,
            },
            {
              label: "Email",
              type: "email",
              value: formData.email,
              onChange: (e) => handleChange("email", e.target.value),
              required: true,
            },
            {
              label: "Password",
              type: showPassword ? "text" : "password",
              value: formData.password,
              onChange: (e) => handleChange("password", e.target.value),
              required: true,
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
            {
              label: "Confirm Password",
              type: "password",
              value: formData.confirmPassword,
              onChange: (e) => handleChange("confirmPassword", e.target.value),
              required: true,
            },
          ]}
        />
      </div>

      {/* Terms Popup */}
      <TermsAndPrivacyPopup
        open={showTermsPopup}
        onAgree={handleAgree}
        onClose={handleClosePopup}
      />
    </div>
  );
}
