export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import InvoicesPageClient from "./InvoicesPageClient";
import { getCompanyInvoices } from "@/services/paymentService";

export default async function InvoicesPage() {
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

        // Prefetch invoices
        await queryClient.prefetchQuery({
            queryKey: ['companyInvoices', companyId],
            queryFn: () => getCompanyInvoices(companyId, options),
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <InvoicesPageClient />
        </HydrationBoundary>
    );
}
