"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import { loginUser } from "@/store/authActions";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true); // default true until we check token
  const [error, setError] = useState("");

  // 🚀 Check localStorage for token before rendering form
  useEffect(() => {
    const token = localStorage.getItem("auth")
      ? JSON.parse(localStorage.getItem("auth"))?.token
      : null;

    if (token) {
      router.replace("/inventory"); // redirect logged-in users
    } else {
      setLoading(false); // no token, show login form
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await dispatch(loginUser(email, password));
      router.push("/inventory");
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

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
          submitLabel={loading ? "Signing In..." : "Sign In"}
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

        {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
