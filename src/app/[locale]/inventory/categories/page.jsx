export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import CategoryList from "@/components/inventory/categories/CategoryList";
import { getCategories } from "@/services/categoriesService";
import ClientProviders from "@/providers/ClientProviders";

export default async function InventoryCategoriesPage() {
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
      sortBy: "name",
      sortOrder: "asc",
      companyId
    };

    // Prefetch categories
    await queryClient.prefetchQuery({
      queryKey: ["categories", defaultParams],
      queryFn: () => getCategories(defaultParams, options),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-gray-50">
        <CategoryList />
      </div>
    </HydrationBoundary>
  );
}