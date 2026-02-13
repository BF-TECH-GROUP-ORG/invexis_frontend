import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SalesPageClient from "./SalesPageClient";
import { getSalesHistory } from "@/services/salesService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { unstable_cache } from "next/cache";

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

    // Helper for server-side persistence using unstable_cache
    const getCachedData = (key, fetcher) =>
      unstable_cache(
        async () => fetcher(),
        [`sales-${key}`, companyId, JSON.stringify(filters)],
        { revalidate: 300, tags: ['sales', `company-${companyId}`] }
      )();

    // Fetch all required data in parallel on the server
    const [sales, shops, workers] = await Promise.all([
      getCachedData('history', () => getSalesHistory(companyId, filters, options)),
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
      sales: sales || [],
      shops: shops || [],
      workers: workers || [],
      soldBy: filters.soldBy,
      shopId: filters.shopId,
      month: month
    };

    return (
      <SalesPageClient initialData={initialData} />
    );
  }

  return <div>Please log in to view sales history.</div>;
}
