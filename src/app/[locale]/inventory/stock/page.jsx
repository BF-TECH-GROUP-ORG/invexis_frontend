import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { getAllStockChanges } from "@/services/stockService";
import StockManagementContent from "./StockManagementContent";

export const metadata = {
  title: "Stock Management",
  description: "Manage inventory levels, scan products, and track changes",
};

export default async function StockManagementPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  // Prefetch stock history (recent changes)
  // We prefetch the first page of stock changes to show in the "History" tab immediately
  if (session?.accessToken) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["stock-changes", { page: 1, limit: 20 }],
        queryFn: () =>
          getAllStockChanges(
            { page: 1, limit: 20 },
            {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          ),
      });
    } catch (error) {
      console.error("Error prefetching stock changes:", error);
    }
  }

  // Derive companyId from authenticated session (first company)
  const companyId = session?.user?.companies?.[0] || null;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StockManagementContent companyId={companyId} />
    </HydrationBoundary>
  );
}
