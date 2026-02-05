export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import TransferList from "@/components/inventory/transfers/TransferList";
import InventoryService from "@/services/inventoryService";
import { getAllShops } from "@/services/shopService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getCompanyDetails, getAllCompanies } from "@/services/stockService";

export default async function TransfersPage() {
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
            limit: 10,
        };

        // Prefetch everything needed for the initial view
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['transfers', companyId, defaultParams],
                queryFn: () => InventoryService.getTransfers(companyId, defaultParams, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['shops', companyId],
                queryFn: () => getAllShops(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['companyWorkers', companyId],
                queryFn: () => getWorkersByCompanyId(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['companyDetails', companyId],
                queryFn: () => getCompanyDetails(companyId, options),
            }),
            queryClient.prefetchQuery({
                queryKey: ['allCompanies'],
                queryFn: () => getAllCompanies(options),
            })
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="min-h-screen bg-slate-50/50">
                <TransferList />
            </div>
        </HydrationBoundary>
    );
}
