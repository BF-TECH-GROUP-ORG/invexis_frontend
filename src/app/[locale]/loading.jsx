"use client";

import GlobalLoader from "@/components/shared/GlobalLoader";

export default function Loading() {
  return <GlobalLoader visible={true} text="Loading page..." />;
}
