"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices } from "@/features/billing/billingSlice";
import CustomerList from "../components/CustomerList";
import { Loader2 } from "lucide-react";

export default function PaymentsPage() {
    const dispatch = useDispatch();
    const { items: invoices, status } = useSelector((state) => state.billing);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchInvoices());
        }
    }, [dispatch, status]);

    if (status === 'loading') {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500">Manage and view customers.</p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <CustomerList invoices={invoices} />
            </div>
        </div>
    );
}
