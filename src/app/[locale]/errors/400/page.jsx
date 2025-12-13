"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function BadRequestPage() {
  return (
    <ErrorPage
      errorCode={400}
      title="Bad Request"
      message="Your request could not be processed. Please check your input and try again."
      illustration="/illustrations/400 Error Bad Request-rafiki.svg"
      showRetry={true}
    />
  );
}
