
import { Suspense } from "react";
import CustomerManagement from "@/components/pages/ecommerce/CustomerManagement";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Customer Management",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <CustomerManagement />
    </Suspense>
  );
}
