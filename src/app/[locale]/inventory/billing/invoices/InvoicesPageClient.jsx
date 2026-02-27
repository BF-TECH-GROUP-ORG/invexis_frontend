"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import InvoiceExplorer from "../components/InvoiceExplorer";
import Loading from "./loading";
import { getCompanyInvoices } from "@/services/paymentService";
import { getAllShops } from "@/services/shopService";
import { Alert } from "@mui/material";

export default function InvoicesPageClient({ initialData, initialParams }) {
    const { data: session } = useSession();

    // Stabilize initial render state by using passed props
    const user = initialData?.user || session?.user;
    const companyId = initialData?.companyId || (user?.companies?.[0] ? (typeof user.companies[0] === 'string' ? user.companies[0] : (user.companies[0].id || user.companies[0]._id)) : null);

    // Prepare options with auth header
    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    const { data: invoicesData, isLoading: isInvoicesLoading, isError, error } = useQuery({
        queryKey: ['companyInvoices', companyId],
        queryFn: () => getCompanyInvoices(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const { data: shopsData, isLoading: isShopsLoading } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getAllShops(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 60 * 60 * 1000,
    });

    const isLoading = isInvoicesLoading || isShopsLoading;

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

            // Resolve real shop name
            const resolvedShop = shopsData?.find(s => String(s.id || s._id) === String(shopId));
            const shopName = resolvedShop?.name ||
                (shopId ? (isShopsLoading ? "Loading..." : `Shop ${shopId.substring(0, 8)}...`) : "Main Shop");

            return {
                id: invoice.invoice_id || invoice.id,
                dbId: invoice.id,
                customer: {
                    name: invoice.customer?.name || originalEvent.customer?.name || "Guest",
                    email: invoice.customer?.email || originalEvent.customer?.email || "",
                    phone: invoice.customer?.phone || originalEvent.customer?.phone || "",
                    address: invoice.customer?.address || "Kigali, Rwanda"
                },
                items: items,
                totalAmount: Number(invoice.amount_due) || 0,
                status: (invoice.status || "Pending").charAt(0).toUpperCase() + (invoice.status || "pending").slice(1),
                paymentMethod: invoice.payment_method || originalEvent.paymentMethod || "Manual",
                date: invoice.created_at,
                signature: true,
                shopName: shopName,
                workerName: workerId ? `Worker ${workerId.substring(0, 8)}...` : "System",
                type: "Income",
                pdfUrl: invoice.pdf_url
            };
        });
    }, [invoicesData, shopsData, isShopsLoading]);

    const showSkeleton = isLoading && !formattedInvoices.length;

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
                {showSkeleton ? (
                    <div className="space-y-4">
                        <div className="h-[400px] w-full bg-gray-50 rounded-2xl animate-pulse border border-gray-100 flex flex-col p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="h-10 w-64 bg-gray-200 rounded-lg" />
                                <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 w-full bg-gray-200 rounded-lg opacity-60" />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <InvoiceExplorer invoices={formattedInvoices} initialParams={initialParams} />
                )}
            </div>
        </div>
    );
}
