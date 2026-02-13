export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import CompaniesPageClient from "./CompaniesPageClient";
import { getBranches } from "@/services/branches";

export default async function CompaniesPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  // Resolve searchParams (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const search = resolvedParams.search || "";
  const filterColumn = resolvedParams.filterColumn || "city";
  const filterOperator = resolvedParams.filterOperator || "contains";
  const filterValue = resolvedParams.filterValue || "";

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    // Prefetch shops
    if (companyId) {
      await queryClient.prefetchQuery({
        queryKey: ["branches", companyId],
        queryFn: () => getBranches(companyId, options),
      });
    }
  }

  const initialParams = {
    search,
    filterColumn,
    filterOperator,
    filterValue
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CompaniesPageClient initialParams={initialParams} />
    </HydrationBoundary>
  );
}
