"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function RateLimitPage() {
  return (
    <ErrorPage
      errorCode={429}
      title="Too Many Requests"
      message="Whoa there! You've hit our rate limit. Take a breather and try again in a minute."
      illustration="/illustrations/Error 429-bro.svg"
      showRetry={true}
    />
  );
}
