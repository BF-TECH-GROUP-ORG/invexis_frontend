"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function NotFoundPage() {
  return (
    <ErrorPage
      errorCode={404}
      title="Page Not Found"
      message="The page you are looking for doesn't exist or has been moved."
      illustration="/illustrations/Oops! 404 Error with a broken robot-amico.svg"
      showRetry={true}
    />
  );
}