export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import CategoryList from "@/components/inventory/categories/CategoryList";
import { getCategories } from "@/services/categoriesService";
import ClientProviders from "@/providers/ClientProviders";

export default async function InventoryCategoriesPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  // Resolve searchParams (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 20;
  const search = resolvedParams.search || "";
  const sortBy = resolvedParams.sortBy || "name";
  const sortOrder = resolvedParams.sortOrder || "asc";
  const level = resolvedParams.level || null;
  const parentCategory = resolvedParams.parentCategory || null;

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
      search: search || undefined,
      level,
      parentCategory,
      sortBy,
      sortOrder,
      companyId
    };

    // Prefetch categories server-side
    await queryClient.prefetchQuery({
      queryKey: ["categories", fetchParams],
      queryFn: () => getCategories(fetchParams, options),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="min-h-screen bg-gray-50">
          <CategoryList initialParams={fetchParams} />
        </div>
      </HydrationBoundary>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">Please log in to view categories.</p>
      </div>
    </div>
  );
}