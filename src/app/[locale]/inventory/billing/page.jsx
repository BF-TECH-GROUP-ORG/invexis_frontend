import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { redirect } from "@/i18n/navigation";
import * as PaymentService from "@/services/paymentService";
import { getAllShops } from "@/services/shopService";

export default async function BillingPage({ params }) {
    const { locale } = await params;
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

        // Prefetch payments and shops for the redirect target
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

    // Server-side redirect to payments
    redirect({ href: "/inventory/billing/payments", locale });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex h-96 items-center justify-center">
                <div className="animate-pulse text-gray-400 font-medium">Redirecting...</div>
            </div>
        </HydrationBoundary>
    );
}

