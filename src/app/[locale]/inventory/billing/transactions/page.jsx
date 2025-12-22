"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices } from "@/features/billing/billingSlice";
import PaymentsList from "../components/PaymentsList";
import Loading from "./loading";

export default function TransactionsPage() {
    const dispatch = useDispatch();
    const { items: invoices, status } = useSelector((state) => state.billing);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchInvoices());
        }
    }, [dispatch, status]);

    if (status === 'loading') {
        return <Loading />;
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-500">Overview of recent transactions.</p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <PaymentsList invoices={invoices} />
            </div>
        </div>
    );
}
