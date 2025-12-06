"use client";

import ProtectedRoute from "@/lib/ProtectedRoute";
import WorkersListPage from "@/components/pages/WorkersListPage";

export default function WorkersProtectedWrapper() {
  return (
    <ProtectedRoute allowedRoles={["company_admin"]}>
      <div>
        <WorkersListPage />
      </div>
    </ProtectedRoute>
  );
}
