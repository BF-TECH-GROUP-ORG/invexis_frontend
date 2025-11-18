import React from "react";
import RequestOTPPage from "@/components/pages/RequestOTPPage";
import { title } from "process";

export const metadata = {
    title: "Request OTP",
}

const RequestOTP = () => {
  return (
    <div>
      <RequestOTPPage />
    </div>
  );
};

export default RequestOTP;
