export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import ProductList from "@/components/inventory/products/ProductList";
import { getProducts } from "@/services/productsService";
import { getCategories } from "@/services/categoriesService";
import ClientProviders from "@/providers/ClientProviders";

export default async function InventoryStockPage() {
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

    const defaultParams = {
      page: 1,
      limit: 20,
      companyId,
    };

    // Prefetch products and categories
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["products", defaultParams],
        queryFn: () => getProducts(defaultParams, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["categories", { companyId }],
        queryFn: () => getCategories({ companyId }, options),
      })
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-white">
        <div className="pt-8">
          <ProductList />
        </div>
      </div>
    </HydrationBoundary>
  );
}