import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { getDebts } from "@/services/debts";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import DebtsPageContent from "./DebtsPageContent";

export const metadata = {
  title: "Debts Management",
  description: "Manage customer debts and repayments",
};

export default async function DebtsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Resolve searchParams (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const soldBy = resolvedParams.soldBy || (user?._id || user?.id || "");
  const shopId = resolvedParams.shopId || "";

  if (session?.accessToken && companyId) {
    const authHeaders = {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    };

    try {
      // Parallel prefetching for maximum performance
      await Promise.all([
        // Prefetch workers
        queryClient.prefetchQuery({
          queryKey: ["workers", companyId],
          queryFn: () => getWorkersByCompanyId(companyId, authHeaders),
        }),
        // Prefetch shops
        queryClient.prefetchQuery({
          queryKey: ["shops", companyId],
          queryFn: () => getBranches(companyId, authHeaders),
        }),
        // Prefetch debts with current filters
        queryClient.prefetchQuery({
          queryKey: ["debts", companyId, soldBy, shopId],
          queryFn: () => getDebts(companyId, { soldBy, shopId }, authHeaders),
        }),
      ]);
    } catch (error) {
      console.error("Error prefetching debts page data:", error);
    }

    const initialParams = {
      soldBy,
      shopId,
      companyId
    };

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading debts...</div></div>}>
          <DebtsPageContent initialParams={initialParams} />
        </Suspense>
      </HydrationBoundary>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">Please log in to view debts.</p>
      </div>
    </div>
  );
}