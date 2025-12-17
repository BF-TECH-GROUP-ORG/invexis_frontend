"use client";
import { Smartphone, CreditCard, Banknote, Landmark, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const methodIcons = {
    Momo: <Smartphone className="text-yellow-600" size={20} />,
    Card: <CreditCard className="text-purple-600" size={20} />,
    Cash: <Banknote className="text-green-600" size={20} />,
    Bank: <Landmark className="text-blue-600" size={20} />,
};

const statusStyles = {
    Paid: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-orange-100 text-orange-700 border-orange-200",
};

import EcommerceDataTable from "@/components/shared/EcommerceDataTable";

export default function PaymentsList({ invoices }) {
    const columns = [
        {
            id: "customer",
            label: "Customer",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm">{row.customer.name}</span>
                    <span className="text-xs text-gray-400">{row.id}</span>
                </div>
            )
        },
        {
            id: "method",
            label: "Method",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                        {methodIcons[row.paymentMethod] || <Banknote size={20} />}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{row.paymentMethod}</span>
                </div>
            )
        },
        {
            id: "amount",
            label: "Amount",
            render: (row) => (
                <span className="text-sm font-bold text-gray-900">
                    {Number(row.totalAmount).toLocaleString()} FRW
                </span>
            )
        },
        {
            id: "date",
            label: "Date",
            render: (row) => (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Clock size={14} />
                    {format(new Date(row.date), "MMM dd, HH:mm")}
                </div>
            )
        },
        {
            id: "status",
            label: "Status",
            render: (row) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[row.status] || statusStyles.Pending}`}>
                    {row.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">Recent Payments</h2>
                <p className="text-sm text-gray-500">Overview of recent transactions</p>
            </div>

            <EcommerceDataTable
                columns={columns}
                rows={invoices}
                keyField="id"
                initialRowsPerPage={5}
                showSearch={true}
            />
        </div>
    );
}
