import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SalesPageClient from "./SalesPageClient";
import { getSalesHistory } from "@/services/salesService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { unstable_cache } from "next/cache";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

export const dynamic = 'force-dynamic';

export default async function SalesPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  // Await searchParams if it's a promise (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const soldBy = resolvedParams.soldBy || "";
  const shopId = resolvedParams.shopId || "";
  const month = resolvedParams.month || "";

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    const filters = {
      soldBy: soldBy || user?.id || user?._id || "",
      shopId: shopId || ""
    };

    const queryClient = getQueryClient();

    // Prefetch sales history with the SAME query key the client will use
    // so it hydrates instantly without a loading flash
    await queryClient.prefetchQuery({
      queryKey: ["salesHistory", companyId, filters.soldBy, filters.shopId],
      queryFn: () => getSalesHistory(companyId, filters, options),
    });

    // Shops and workers are slow-changing — keep using unstable_cache for these
    const [shops, workers] = await Promise.all([
      unstable_cache(
        async () => getBranches(companyId, options),
        [`shops`, companyId],
        { revalidate: 600, tags: ['shops', `company-${companyId}`] }
      )(),
      unstable_cache(
        async () => getWorkersByCompanyId(companyId, options),
        [`workers`, companyId],
        { revalidate: 600, tags: ['workers', `company-${companyId}`] }
      )()
    ]);

    const initialData = {
      companyId,
      shops: shops || [],
      workers: workers || [],
      soldBy: filters.soldBy,
      shopId: filters.shopId,
      month: month
    };

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SalesPageClient initialData={initialData} />
      </HydrationBoundary>
    );
  }

  return <div>Please log in to view sales history.</div>;
}
