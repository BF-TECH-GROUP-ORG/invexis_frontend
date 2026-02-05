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

export default async function DebtsPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  if (session?.accessToken && companyId) {
    const authHeaders = {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    };

    try {
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
        // Prefetch debts (initial view: no filters)
        queryClient.prefetchQuery({
          queryKey: ["debts", companyId, "", ""], // matches [companyId, selectedWorkerId, selectedShopId] with empty strings
          queryFn: () => getDebts(companyId, { soldBy: "", shopId: "" }, authHeaders),
        }),
      ]);
    } catch (error) {
      console.error("Error prefetching debts page data:", error);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading debts...</div></div>}>
        <DebtsPageContent companyId={companyId} />
      </Suspense>
    </HydrationBoundary>
  );
}