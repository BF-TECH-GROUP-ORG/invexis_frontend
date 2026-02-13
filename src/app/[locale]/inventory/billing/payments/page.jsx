export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import PaymentDashboard from "./dashboard";
import * as PaymentService from "@/services/paymentService";
import { getAllShops } from "@/services/shopService";

export default async function PaymentsPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    // Resolve searchParams (Next.js 15 behavior)
    const resolvedParams = await (searchParams || {});
    const search = resolvedParams.search || "";
    const startDate = resolvedParams.startDate || null;
    const endDate = resolvedParams.endDate || null;
    const shop = resolvedParams.shop || "";
    const method = resolvedParams.method || "";
    const status = resolvedParams.status || "";
    const page = resolvedParams.page || "0";
    const limit = resolvedParams.limit || "10";

    if (session?.accessToken) {
        const user = session.user;
        const companyObj = user?.companies?.[0];
        const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

        const options = {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        };

        // Prefetch payments and shops
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['payments', 'company', companyId],
                queryFn: () => PaymentService.getCompanyPayments(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['shops', companyId],
                queryFn: () => getAllShops(companyId, options),
            })
        ]);
    }

    const initialParams = {
        search,
        startDate,
        endDate,
        shop,
        method,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
    };

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PaymentDashboard initialParams={initialParams} />
        </HydrationBoundary>
    );
}