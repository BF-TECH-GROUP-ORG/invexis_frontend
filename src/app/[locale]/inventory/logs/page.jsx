export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import LogsPageClient from "./LogsPageClient";
import { getAuditLogs } from "@/services/auditService";
import { getWorkersByCompanyId } from "@/services/workersService";

export default async function LogsPage() {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

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

        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ["workers", companyId],
                queryFn: () => getWorkersByCompanyId(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ["auditLogs", companyId, "", ""],
                queryFn: () => getAuditLogs(companyId, {
                    userId: "",
                    event_type: ""
                }, options),
            })
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <LogsPageClient initialData={initialData} />
        </HydrationBoundary>
    );
}
