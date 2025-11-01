import RequestResetPasswordPage from "@/components/pages/RequestResetPasswordPage";
import React from "react";

export const metadata = {
  title: "Reset Password",
};

const ForgotPassword = () => {
  return (
    <div>
      <RequestResetPasswordPage />
    </div>
  );
};

export default ForgotPassword;
