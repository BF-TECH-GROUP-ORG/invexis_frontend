import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import SalesPageClient from "./SalesPageClient";
import { getSalesHistory } from "@/services/salesService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);
    const userRole = user?.role;
    const assignedDepartments = user?.assignedDepartments || [];
    const isWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";
    const currentUserId = user?._id || user?.id;

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    // Prefetch queries for the initial view
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ["salesHistory", companyId, currentUserId, ""],
        queryFn: () => getSalesHistory(companyId, {
          soldBy: currentUserId,
          shopId: ""
        }, options),
      })
    ];

    if (!isWorker) {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: ["workers", companyId],
          queryFn: () => getWorkersByCompanyId(companyId, options),
        }),
        queryClient.prefetchQuery({
          queryKey: ["shops", companyId],
          queryFn: () => getBranches(companyId, options),
        })
      );
    }

    await Promise.all(prefetchPromises);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SalesPageClient />
    </HydrationBoundary>
  );
}
