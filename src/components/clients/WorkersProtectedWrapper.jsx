"use client";

import ProtectedRoute from "@/lib/ProtectedRoute";
import WorkersListPage from "@/components/pages/WorkersListPage";

export default function WorkersProtectedWrapper({ companyId }) {
  return (
    <ProtectedRoute allowedRoles={["company_admin"]} allowedDepartments={["management"]}>
      <div>
        <WorkersListPage companyId={companyId} />
      </div>
    </ProtectedRoute>
  );
}
