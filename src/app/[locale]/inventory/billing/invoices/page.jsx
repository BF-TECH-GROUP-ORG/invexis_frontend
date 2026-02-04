"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import InvoiceExplorer from "../components/InvoiceExplorer";
import Loading from "./loading";
import { getCompanyInvoices } from "@/services/paymentService";
import { Alert } from "@mui/material";

export default function InvoicesPage() {
    const { data: session } = useSession();

    // Robust companyId extraction matching SalesPageClient
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Prepare options with auth header
    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    const { data: invoicesData, isLoading, isError, error } = useQuery({
        queryKey: ['companyInvoices', companyId],
        queryFn: () => getCompanyInvoices(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 60000, // 1 minute
    });

    const formattedInvoices = useMemo(() => {
        if (!invoicesData?.data || !Array.isArray(invoicesData.data)) return [];

        return invoicesData.data.map(invoice => {
            const metadata = invoice.metadata || {};
            const originalEvent = metadata.originalEvent || {};

            // Extract line items
            let items = [];
            if (invoice.line_items && typeof invoice.line_items === 'object' && Object.keys(invoice.line_items).length > 0) {
                // If line_items is an object (unexpected but handled based on sample showing {})
                items = Array.isArray(invoice.line_items) ? invoice.line_items : Object.values(invoice.line_items);
            } else if (Array.isArray(originalEvent.lineItems)) {
                items = originalEvent.lineItems;
            }

            // Extract names and IDs
            const shopId = invoice.shop_id || originalEvent.shopId || "";
            const workerId = invoice.seller_id || originalEvent.initiatedBy || "";

            return {
                id: invoice.invoice_id || invoice.id, // Prefer invoice_id for display if available
                dbId: invoice.id,
                customer: {
                    name: invoice.customer?.name || originalEvent.customer?.name || "Guest",
                    email: invoice.customer?.email || originalEvent.customer?.email || "",
                    phone: invoice.customer?.phone || originalEvent.customer?.phone || "",
                    address: invoice.customer?.address || "Kigali, Rwanda" // Default if missing
                },
                items: items,
                totalAmount: Number(invoice.amount_due) || 0,
                status: (invoice.status || "Pending").charAt(0).toUpperCase() + (invoice.status || "pending").slice(1),
                paymentMethod: invoice.payment_method || originalEvent.paymentMethod || "Manual",
                date: invoice.created_at,
                signature: true,
                shopName: shopId ? `Shop ${shopId.substring(0, 8)}...` : "Main Shop",
                workerName: workerId ? `Worker ${workerId.substring(0, 8)}...` : "System",
                type: "Income", // Sales are income
                pdfUrl: invoice.pdf_url
            };
        });
    }, [invoicesData]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="p-4">
                <Alert severity="error">
                    {error?.message || "Failed to load invoices. Please try again later."}
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-8 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500">Manage invoices and track billing history.</p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <InvoiceExplorer invoices={formattedInvoices} />
            </div>
        </div>
    );
}
