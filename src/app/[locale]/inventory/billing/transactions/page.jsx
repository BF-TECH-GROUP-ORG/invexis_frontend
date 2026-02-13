export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import TransactionsPageClient from "./TransactionsPageClient";
import { getCompanyTransactions } from "@/services/paymentService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getAllShops } from "@/services/shopService";

export default async function TransactionsPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    // Resolve searchParams (Next.js 15 behavior)
    const resolvedParams = await (searchParams || {});
    const shop = resolvedParams.shop || "All";
    const worker = resolvedParams.worker || "All";
    const type = resolvedParams.type || "All";
    const startDate = resolvedParams.startDate || "";
    const endDate = resolvedParams.endDate || "";

    let initialData = { companyId: null, user: null };

    if (session?.accessToken) {
        const user = session.user;
        const companyObj = user?.companies?.[0];
        const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

        initialData = { companyId, user };

        const options = {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        };

        // Prefetch transactions, shops, and workers
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['companyTransactions', companyId, session.accessToken],
                queryFn: () => getCompanyTransactions(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['shops', companyId],
                queryFn: () => getAllShops(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['companyWorkers', companyId, session.accessToken],
                queryFn: () => getWorkersByCompanyId(companyId, options),
            })
        ]);
    }

    const initialParams = {
        shop,
        worker,
        type,
        startDate,
        endDate
    };

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TransactionsPageClient initialData={initialData} initialParams={initialParams} />
        </HydrationBoundary>
    );
}
