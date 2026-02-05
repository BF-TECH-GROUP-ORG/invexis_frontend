"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function useRouteLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When pathname/searchParams update, the router transition is complete.
    // Set isNavigating to false immediately to show content and avoid flashes.
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const startNavigating = () => setIsNavigating(true);

  return { isNavigating, startNavigating };
}
