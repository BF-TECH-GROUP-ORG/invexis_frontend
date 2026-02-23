
import AddWorkerForm from "@/components/forms/AddWorkerForm";
import { Suspense } from "react";
import { getBranches } from "@/services/branches";
import { getDepartmentsByCompany } from "@/services/departmentsService";
import { unstable_cache } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function AddWorker({ params }) {
  const session = await getServerSession(authOptions);
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  const queryClient = new QueryClient();

  if (companyId) {
    const getCached = (key, fetcher) =>
      unstable_cache(
        async () => fetcher(),
        [`add-worker-${key}`, companyId],
        { revalidate: 300, tags: ['workers', `company-${companyId}`] }
      )();

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["branches", companyId],
        queryFn: () => getCached('branches', () => getBranches(companyId)),
      }),
      queryClient.prefetchQuery({
        queryKey: ["departments", companyId],
        queryFn: () => getCached('departments', () => getDepartmentsByCompany(companyId)),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={null}>
        <AddWorkerForm />
      </Suspense>
    </HydrationBoundary>
  );
}
