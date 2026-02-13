import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import ShopInventoryPageClient from "./ShopInventoryPageClient";
import { getShopInventory } from "@/services/shopInventoryService";

export default async function ShopInventoryPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    // Resolve searchParams (Next.js 15 behavior)
    const resolvedParams = await (searchParams || {});
    const page = parseInt(resolvedParams.page) || 1;
    const limit = parseInt(resolvedParams.limit) || 20;
    const search = resolvedParams.search || "";
    const lowStock = resolvedParams.lowStock || "all";

    if (session?.accessToken) {
        const user = session.user;
        const shopId = resolvedParams.shopId || user?.shops?.[0] || "demo-shop";

        const options = {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        };

        const fetchParams = {
            shopId,
            page,
            limit,
            search: search || undefined,
            lowStock: lowStock !== "all" ? lowStock : undefined
        };

        // Prefetch shop inventory
        await queryClient.prefetchQuery({
            queryKey: ['shop-inventory', shopId, fetchParams],
            queryFn: () => getShopInventory(fetchParams, options),
        });

        const initialParams = {
            shopId,
            page,
            limit,
            search,
            lowStock
        };

        return (
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ShopInventoryPageClient initialParams={initialParams} />
            </HydrationBoundary>
        );
    }

    return <ShopInventoryPageClient initialParams={{ page, limit, search, lowStock }} />;
}
