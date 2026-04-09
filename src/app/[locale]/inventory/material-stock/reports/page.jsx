import { Suspense } from "react";
import MaterialReports from "@/components/inventory/materials/reports/MaterialReports";

export const metadata = {
  title: "Material Stock Reports | Invexis Inventory",
  description: "Advanced reporting and analytics for non-saleable internal assets.",
};

export default function MaterialReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8 px-4 md:px-8 pb-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#081422]"></div>
          </div>
        }>
          <MaterialReports />
        </Suspense>
      </div>
    </div>
  );
}
