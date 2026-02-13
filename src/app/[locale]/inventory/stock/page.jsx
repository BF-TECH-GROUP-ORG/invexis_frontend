import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { getAllStockChanges, getDailySummary, getStockChangeHistory } from "@/services/stockService";
import productsService from "@/services/productsService";
import StockManagementContent from "./StockManagementContent";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stockManagement.header" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function StockManagementPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  // Resolve searchParams (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const tab = resolvedParams.tab || "scanner";
  const search = resolvedParams.search || "";
  const type = resolvedParams.type || "all";
  const page = parseInt(resolvedParams.page || "0");
  const limit = parseInt(resolvedParams.limit || "10");

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    };

    try {
      // Prefetch basic requirements
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["daily-summary", companyId],
          queryFn: () => getDailySummary({ companyId }, options),
        }),
        queryClient.prefetchQuery({
          queryKey: ["products-cache", companyId],
          queryFn: () => productsService.getProducts({ companyId, limit: 1000 }, options),
        }),
        queryClient.prefetchQuery({
          queryKey: ["stock-change-history", { page: page + 1, limit: limit, companyId }],
          queryFn: () => getStockChangeHistory({ page: page + 1, limit: limit, companyId }, options),
        })
      ]);
    } catch (error) {
      console.error("Error prefetching stock data:", error);
    }
  }

  const initialParams = {
    tab,
    search,
    type,
    page,
    limit
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StockManagementContent initialParams={initialParams} />
    </HydrationBoundary>
  );
}
