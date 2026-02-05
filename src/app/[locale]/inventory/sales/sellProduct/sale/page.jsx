export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import SaleProductClient from "./SaleProductClient";
import { getAllProducts } from "@/services/salesService";

export default async function SaleProductPage() {
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

        // Prefetch all products
        await queryClient.prefetchQuery({
            queryKey: ["allProducts", companyId],
            queryFn: () => getAllProducts(companyId, options),
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SaleProductClient />
        </HydrationBoundary>
    );
}