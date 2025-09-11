"use client";

import { useState } from "react";
import Image from "next/image";
import { HiChevronLeft, HiArrowRight, HiCog } from "react-icons/hi";
import FormWrapper from "./FormWrapper";
import Link from "next/link";
import { IconButton } from "@mui/material";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
  };

  return (
    <div className="w-screen h-screen flex text-xs flex-col md:flex-row bg-white">
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
        <div className="top-left fixed top-10 flex items-center right-10 hover:underline">
          <Link href="#">Need Help?</Link>
          <IconButton
            sx={{
              borderRadius: "50%",
              border: "1px solid #e0e0e0",
              width: "50px",
              height: "50px",   
            }}
          >
            <HiCog />
          </IconButton>
        </div>
        <FormWrapper
          title="Reset Password"
          desc="Please enter the email address associated with your account and we'll email you a link to reset your password."
          onSubmit={handleSubmit}
          submitLabel="Send Request"
          submitIcon={<HiArrowRight />}
          fields={[
            {
              label: "Email",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              placeholder: "example@gmail.com",
            },
          ]}
          oauthOptions={["google", "apple"]}
          extraLinks={[
            {
              href: "/auth/login",
              icon: <HiChevronLeft />,
              label: "Return to Login",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ResetPasswordForm;
