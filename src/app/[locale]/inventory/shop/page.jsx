import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import ShopInventoryPageClient from "./ShopInventoryPageClient";
// import { getShopInventory } from "@/services/shopInventoryService";

export default async function ShopInventoryPage() {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    if (session?.accessToken) {
        const user = session.user;
        const shopId = user?.shops?.[0] || "demo-shop";

        const options = {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        };

        // Prefetching removed to prevent SSR crashes with apiClient.
        /*
        await queryClient.prefetchQuery({
            queryKey: ['shop-inventory', shopId],
            queryFn: () => getShopInventory({ shopId }, options),
        });
        */
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShopInventoryPageClient />
        </HydrationBoundary>
    );
}
