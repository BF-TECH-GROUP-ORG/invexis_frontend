export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import ProductList from "@/components/inventory/products/ProductList";
import { getProducts } from "@/services/productsService";
import { getCategories } from "@/services/categoriesService";

export default async function InventoryStockPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  // Resolve searchParams (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 20;
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const warehouse = resolvedParams.warehouse || "";
  const status = resolvedParams.status || "";

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    const fetchParams = {
      page,
      limit,
      companyId,
      search: search || undefined,
      category: category || undefined,
      warehouse: warehouse || undefined,
      status: status || undefined,
    };

    // Prefetch products and categories
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["products", fetchParams],
        queryFn: () => getProducts(fetchParams, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ["categories", { companyId }],
        queryFn: () => getCategories({ companyId }, options),
      })
    ]);

    const initialParams = {
      page,
      limit,
      search,
      category,
      warehouse,
      status,
      companyId
    };

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="min-h-screen bg-white">
          <div className="pt-8">
            <ProductList initialParams={initialParams} />
          </div>
        </div>
      </HydrationBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8">
        <ProductList initialParams={{ page, limit, search, category, warehouse, status }} />
      </div>
    </div>
  );
}