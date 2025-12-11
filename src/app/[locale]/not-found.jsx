"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      errorCode={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved. Let's get you back on track!"
      illustration="/illustrations/404 error lost in space-bro.svg"
      showRetry={false}
    />
  );
}
