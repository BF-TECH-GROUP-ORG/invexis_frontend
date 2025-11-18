"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      router.push("/unauthorized");
    }
  }, [token, user, allowedRoles, router]);

  return <>{children}</>;
}
