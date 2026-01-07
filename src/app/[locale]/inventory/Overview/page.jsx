import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import InventoryOverviewPage from "@/components/inventory/Overview/InventoryOverviewPage";
import OverviewService from "@/services/overviewService";
import productsService from "@/services/productsService";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId =
      typeof companyObj === "string"
        ? companyObj
        : companyObj?.id || companyObj?._id;

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    };

    // Prefetch all queries used in useInventoryOverview hook
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["overview", "dashboard", companyId],
        queryFn: () => OverviewService.getDashboardData(companyId, {}, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "company", companyId],
        queryFn: () => OverviewService.getCompanyOverview(companyId, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "inventory-summary", companyId],
        queryFn: () => OverviewService.getInventorySummary(companyId, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "shops", companyId],
        queryFn: () => OverviewService.getShops({ companyId }, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "stockout-risk", companyId],
        queryFn: () => OverviewService.getStockoutRisk({ companyId }, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "top-products", companyId],
        queryFn: () => OverviewService.getTopProducts({ companyId }, options),
      }),
      // Prefetch unified overview analytics (replaces stock changes / many smaller endpoints)
      queryClient.prefetchQuery({
        queryKey: ["overview", "analytics", companyId],
        queryFn: () =>
          OverviewService.getOverviewAnalytics({ companyId }, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "products", companyId],
        queryFn: () =>
          OverviewService.getProducts({ companyId, limit: 50 }, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "products-full", companyId],
        queryFn: () =>
          productsService.getProducts({ companyId, limit: 1000 }, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["overview", "trends", companyId],
        queryFn: () =>
          OverviewService.getInventoryTrends(
            { companyId, period: "month" },
            options
          ),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InventoryOverviewPage />
    </HydrationBoundary>
  );
}
