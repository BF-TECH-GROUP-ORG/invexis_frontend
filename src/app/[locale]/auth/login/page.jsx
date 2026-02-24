import LoginForm from "@/components/forms/LoginForm";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login",
};

const Login = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      <LoginForm />
    </div>
  );
};

export default Login;
