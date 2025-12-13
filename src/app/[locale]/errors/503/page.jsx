"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function ServiceUnavailablePage() {
  return (
    <ErrorPage
      errorCode={503}
      title="Service Unavailable"
      message="Our service is temporarily down for maintenance. We'll be back up shortly. Thanks for your patience!"
      illustration="/illustrations/503 Error Service Unavailable-cuate.svg"
      showRetry={true}
    />
  );
}
