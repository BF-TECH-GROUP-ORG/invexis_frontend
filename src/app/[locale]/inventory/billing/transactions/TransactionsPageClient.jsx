"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyTransactions } from "@/services/paymentService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getAllShops } from "@/services/shopService";
import TransactionsList from "../components/TransactionsList";
import Loading from "./loading";

export default function TransactionsPageClient({ initialData, initialParams }) {
    const { data: session, status: sessionStatus } = useSession();

    // Stabilize initial render state by using passed props
    const user = initialData?.user || session?.user;
    const companyId = initialData?.companyId || (user?.companies?.[0] ? (typeof user.companies[0] === 'string' ? user.companies[0] : (user.companies[0].id || user.companies[0]._id)) : null);

    // Prepare options with auth header
    const options = useMemo(() => {
        return session?.accessToken ? {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        } : {};
    }, [session?.accessToken]);

    // Fetch Transactions
    const {
        data: response,
        isLoading: isTxLoading,
        isError: isTxError,
        error: txError
    } = useQuery({
        queryKey: ['companyTransactions', companyId, session?.accessToken],
        queryFn: async () => {
            const res = await getCompanyTransactions(companyId, options);
            return res;
        },
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    // Fetch Shops - MATCHING PAYMENTS PAGE
    const {
        data: shopsData,
        isLoading: isShopsLoading
    } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getAllShops(companyId, options),
        enabled: !!companyId,
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 120 * 60 * 1000, // 2 hours
    });

    // Fetch Workers
    const {
        data: workersData,
        isLoading: isWorkersLoading
    } = useQuery({
        queryKey: ['companyWorkers', companyId, session?.accessToken],
        queryFn: () => getWorkersByCompanyId(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
    const isLoading = isTxLoading || isShopsLoading || isWorkersLoading;
    const transactions = response?.data || response || [];
    const shops = shopsData || [];
    const workers = workersData || [];

    const showSkeleton = (sessionStatus === "loading" || isLoading) && !transactions.length;

    if (isTxError) {
        return (
            <div className="p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
                    <p className="font-bold">Error loading transactions</p>
                    <p className="text-sm">{txError?.message || "Please check your connection and try again."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-8 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-gray-500 text-sm">Real-time overview of your company transactions.</p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {showSkeleton ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
                            ))}
                        </div>
                        <div className="h-[500px] bg-gray-50 rounded-2xl animate-pulse border border-gray-100 p-6 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-10 w-48 bg-gray-200 rounded-lg" />
                                <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                            </div>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-14 bg-gray-200 rounded-xl opacity-60" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <TransactionsList
                        transactions={transactions}
                        shops={shops}
                        workers={workers}
                        initialParams={initialParams}
                    />
                )}
            </div>
        </div>
    );
}
