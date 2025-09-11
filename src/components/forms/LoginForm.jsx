"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import FormWrapper from "./FormWrapper";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white">
      {/* Left Side - Image */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-gray-50 relative">
        <Image
          src="/images/6.png"
          alt="Login Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[90%] px-4"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Sign In"
          onSubmit={handleSubmit}
          submitLabel="Sign In"
          submitIcon={<HiArrowRight />}
          fields={[
            {
              label: "Email Address",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
            },
            {
              label: "Password",
              type: showPassword ? "text" : "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              before: (
                <div className="flex justify-end -mb-4">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:underline font-metropolis"
                  >
                    Forgot your password?
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
          oauthOptions={["google", "apple"]}
          extraLinks={[
            {
              href: "/signup",
              label: "Don't have an account? Sign Up",
            },
          ]}
        />
      </div>
    </div>
  );
}

export default LoginPage;