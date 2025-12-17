import EcommerceDataTable from "@/components/shared/EcommerceDataTable";
import { User, Phone, Mail, MapPin } from "lucide-react";

export default function CustomerList({ invoices }) {
    // Derive unique customers from invoices
    const customers = invoices.reduce((acc, inv) => {
        const existing = acc.find(c => c.name === inv.customer.name);
        if (!existing) {
            acc.push({
                ...inv.customer,
                totalSpent: inv.totalAmount,
                invoiceCount: 1,
                lastActive: inv.date
            });
        } else {
            existing.totalSpent += inv.totalAmount;
            existing.invoiceCount += 1;
            // Update last active if newer
            if (new Date(inv.date) > new Date(existing.lastActive)) {
                existing.lastActive = inv.date;
            }
        }
        return acc;
    }, []);

    const columns = [
        {
            id: "name",
            label: "Customer Name",
            render: (row) => (
                <span className="font-bold text-gray-900">{row.name}</span>
            )
        },
        {
            id: "contact",
            label: "Contact Info",
            render: (row) => (
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {row.phone}
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {row.email}
                    </div>
                </div>
            )
        },
        {
            id: "address",
            label: "Address",
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    {row.address}
                </div>
            )
        },
        {
            id: "spent",
            label: "Total Spent",
            render: (row) => (
                <span className="font-bold text-gray-900">{Number(row.totalSpent).toLocaleString()} FRW</span>
            )
        },
        {
            id: "invoices",
            label: "Invoices",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        {row.invoiceCount}
                    </span>
                    <span className="text-xs text-gray-400">
                        Last: {new Date(row.lastActive).toLocaleDateString()}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <User className="text-orange-500" />
                    Customer Directory
                </h2>
                <p className="text-sm text-gray-500">Full details of clients and their billing history.</p>
            </div>

            <EcommerceDataTable
                columns={columns}
                rows={customers}
                keyField="name" // unique identifier for customer
                initialRowsPerPage={5}
                showSearch={true}
            />
        </div>
    );
}
