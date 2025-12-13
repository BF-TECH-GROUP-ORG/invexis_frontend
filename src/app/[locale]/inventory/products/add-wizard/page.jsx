"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import AddProductWizard from "@/components/products/add/AddProductWizard";
import { redirect } from "next/navigation";

export default function AddProductWizardPage() {
  const { data: session, status } = useSession();

  // Get company and shop IDs from session
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  // For now, using a default shop ID - you can modify this based on your needs
  const shopId = session?.user?.shopId || "default_shop";

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Company Found
          </h2>
          <p className="text-gray-600">
            Please ensure you are associated with a company.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <AddProductWizard companyId={companyId} shopId={shopId} />
    </Suspense>
  );
}
