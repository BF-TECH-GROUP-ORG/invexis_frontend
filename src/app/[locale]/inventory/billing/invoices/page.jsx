export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import InvoicesPageClient from "./InvoicesPageClient";
import { getCompanyInvoices } from "@/services/paymentService";

export default async function InvoicesPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    // Resolve searchParams (Next.js 15 behavior)
    const resolvedParams = await (searchParams || {});
    const shop = resolvedParams.shop || "All";
    const worker = resolvedParams.worker || "All";
    const type = resolvedParams.type || "All";
    const startDate = resolvedParams.startDate || "";
    const endDate = resolvedParams.endDate || "";
    const view = resolvedParams.view || "years";
    const year = resolvedParams.year || null;
    const month = resolvedParams.month || null;

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

        // Prefetch invoices
        // Note: Currently getCompanyInvoices doesn't take filters as args in the service, 
        // but pre-fetching the whole list allows for instant client-side filtering.
        await queryClient.prefetchQuery({
            queryKey: ['companyInvoices', companyId],
            queryFn: () => getCompanyInvoices(companyId, options),
        });
    }

    const initialParams = {
        shop,
        worker,
        type,
        startDate,
        endDate,
        view,
        year,
        month
    };

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <InvoicesPageClient initialData={initialData} initialParams={initialParams} />
        </HydrationBoundary>
    );
}
