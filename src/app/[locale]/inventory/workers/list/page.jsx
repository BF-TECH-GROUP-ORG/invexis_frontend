import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { getWorkersByCompanyId } from "@/services/workersService";
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

  // Prefetch workers if authenticated
  if (session?.accessToken && companyId) {
    try {
      const options = {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      };
      
      await queryClient.prefetchQuery({
        queryKey: ["workers", companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
      });
      
      console.log("✅ Successfully prefetched workers on server");
    } catch (error) {
      console.error("⚠️ Error prefetching workers list:", error);
      // Continue without prefetch - client will fetch
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkersProtectedWrapper companyId={companyId} />
    </HydrationBoundary>
  );
}
