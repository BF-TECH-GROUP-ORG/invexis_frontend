"use client";

import ProtectedRoute from "@/lib/ProtectedRoute";
import WorkersListPage from "@/components/pages/WorkersListPage";

export default function WorkersProtectedWrapper({ initialParams }) {
  return (
    <ProtectedRoute allowedRoles={["company_admin"]} allowedDepartments={["management"]}>
      <div>
        <WorkersListPage initialParams={initialParams} />
      </div>
    </ProtectedRoute>
  );
}
