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

export default async function TransfersPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    // Resolve searchParams (Next.js 15 behavior)
    const resolvedParams = await (searchParams || {});
    const page = parseInt(resolvedParams.page) || 1;
    const limit = parseInt(resolvedParams.limit) || 10;
    const search = resolvedParams.search || "";
    const direction = resolvedParams.direction || "all";
    const type = resolvedParams.type || "all";
    const shop = resolvedParams.shop || "all";
    const worker = resolvedParams.worker || "all";
    const startDate = resolvedParams.startDate || "";
    const endDate = resolvedParams.endDate || "";

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
            transferType: type !== "all" ? type : undefined,
            performedBy: worker !== "all" ? worker : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        if (shop !== "all") {
            if (direction === "outbound") {
                fetchParams.sourceShopId = shop;
            } else {
                fetchParams.destinationShopId = shop;
            }
        } else if (direction !== "all") {
            fetchParams.direction = direction;
        }

        const initialParams = {
            page,
            limit,
            search,
            direction,
            type,
            shop,
            worker,
            startDate,
            endDate,
            companyId
        };

        // Prefetch everything needed for the initial view
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['transfers', companyId, fetchParams],
                queryFn: () => InventoryService.getTransfers(companyId, fetchParams, options),
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

        return (
            <HydrationBoundary state={dehydrate(queryClient)}>
                <div className="min-h-screen bg-slate-50/50">
                    <TransferList initialParams={initialParams} />
                </div>
            </HydrationBoundary>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500">Please log in to view transfers.</p>
            </div>
        </div>
    );
}
