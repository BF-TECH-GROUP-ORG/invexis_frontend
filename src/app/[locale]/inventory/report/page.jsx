import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import ReportsPageClient from "./ReportsPageClient";
import { getReports, getInventorySummary } from "@/services/reportService";

export default async function ReportsPage() {
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

        // Prefetch queries for the initial view (Overview tab)
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['reports', companyId, "", 0, 10],
                queryFn: () => getReports({
                    companyId,
                    page: 1,
                    limit: 10,
                }, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['inventory-summary', companyId],
                queryFn: () => getInventorySummary(companyId, options),
            })
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReportsPageClient />
        </HydrationBoundary>
    );
}