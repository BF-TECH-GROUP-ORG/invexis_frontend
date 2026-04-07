import { Suspense } from "react";
import MaterialStockList from "@/components/inventory/materials/MaterialStockList";

export const metadata = {
  title: "Material Stock | Invexis Inventory",
  description: "Manage non-saleable internal assets and warehouse supplies.",
};

export default function MaterialStockPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <MaterialStockList />
        </Suspense>
      </div>
    </div>
  );
}
