"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyTransactions } from "@/services/paymentService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getAllShops } from "@/services/shopService";
import TransactionsList from "../components/TransactionsList";
import Loading from "./loading";
import toast from "react-hot-toast";

export default function TransactionsPage() {
    const { data: session, status: sessionStatus } = useSession();

    // MATCHING INVOICES PAGE EXACTLY
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Prepare options with auth header
    const options = useMemo(() => {
        return session?.accessToken ? {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        } : {};
    }, [session?.accessToken]);

    console.log("[TransactionsPage] Session Status:", sessionStatus);
    console.log("[TransactionsPage] Company ID Resolved:", companyId);
    console.log("[TransactionsPage] Access Token exists:", !!session?.accessToken);

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
        staleTime: 30000,
    });

    // Fetch Shops - MATCHING PAYMENTS PAGE
    const {
        data: shopsData,
        isLoading: isShopsLoading
    } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getAllShops(companyId),
        enabled: !!companyId,
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    // Fetch Workers
    const {
        data: workersData,
        isLoading: isWorkersLoading
    } = useQuery({
        queryKey: ['companyWorkers', companyId, session?.accessToken],
        queryFn: () => getWorkersByCompanyId(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 300000, // 5 mins
    });

    const isLoading = isTxLoading || isShopsLoading || isWorkersLoading;

    if (sessionStatus === "loading" || isLoading) {
        return <Loading />;
    }

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

    const transactions = response?.data || response || [];
    const shops = shopsData || [];
    const workers = workersData || [];

    return (
        <div className="p-4 space-y-8 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-gray-500 text-sm">Real-time overview of your company transactions.</p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TransactionsList
                    transactions={transactions}
                    shops={shops}
                    workers={workers}
                />
            </div>
        </div>
    );
}
