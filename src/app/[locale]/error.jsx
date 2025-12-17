"use client";

import { useEffect } from "react";
import ErrorPage from "@/components/error/ErrorPage";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to console (could be sent to error tracking service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <ErrorPage
      errorCode={500}
      title="Internal Server Error"
      message="Oops! Something went wrong on our end. Our team has been notified and we're working on it."
      illustration="/illustrations/500 Internal Server Error-cuate.svg"
      showRetry={true}
      onRetry={reset}
    />
  );
}
