import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
// import { getWorkersByCompanyId } from "@/services/workersService";
import WorkersProtectedWrapper from "@/components/clients/WorkersProtectedWrapper";

export const metadata = {
  title: "Workers List",
};

export default async function WorkersList() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Prefetching removed to prevent SSR crashes with apiClient. 
  // WorkersTable fetches data client-side.
  /*
  if (session?.accessToken && companyId) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["workers", companyId],
        queryFn: () =>
          getWorkersByCompanyId(companyId, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
      });
    } catch (error) {
      console.error("Error prefetching workers list:", error);
    }
  }
  */

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkersProtectedWrapper companyId={companyId} />
    </HydrationBoundary>
  );
}
