"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function GatewayTimeoutPage() {
  return (
    <ErrorPage
      errorCode={504}
      title="Gateway Timeout"
      message="The server took too long to respond. Please check your connection and try again."
      illustration="/illustrations/504 Error Gateway Timeout-rafiki.svg"
      showRetry={true}
    />
  );
}
