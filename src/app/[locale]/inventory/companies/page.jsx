export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import CompaniesPageClient from "./CompaniesPageClient";
import { getBranches } from "@/services/branches";

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    // Prefetch shops only if companyId is available
    if (companyId) {
      await queryClient.prefetchQuery({
        queryKey: ["branches", companyId],
        queryFn: () => getBranches(companyId, options),
      });
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CompaniesPageClient />
    </HydrationBoundary>
  );
}
