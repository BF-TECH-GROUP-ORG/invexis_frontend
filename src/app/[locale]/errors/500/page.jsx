"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function InternalServerErrorPage() {
  return (
    <ErrorPage
      errorCode={500}
      title="Internal Server Error"
      message="Oops! Something went wrong on our end. Our team has been notified and we're working to fix it."
      illustration="/illustrations/500 Internal Server Error-cuate.svg"
      showRetry={true}
    />
  );
}
