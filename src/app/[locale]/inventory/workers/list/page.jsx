import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { getWorkersByCompanyId } from "@/services/workersService";
import WorkersProtectedWrapper from "@/components/clients/WorkersProtectedWrapper";

export const metadata = {
  title: "Workers List",
};

export default async function WorkersList({ searchParams }) {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  // Resolve searchParams (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const search = resolvedParams.search || "";
  const filter = resolvedParams.filter || "";

  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  if (session?.accessToken && companyId) {
    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    try {
      await queryClient.prefetchQuery({
        queryKey: ["workers", companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
      });
    } catch (error) {
      console.error("Error prefetching workers list:", error);
    }
  }

  const initialParams = {
    page,
    limit,
    search,
    filter,
    companyId
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkersProtectedWrapper initialParams={initialParams} />
    </HydrationBoundary>
  );
}
