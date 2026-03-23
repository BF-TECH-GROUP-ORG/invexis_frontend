"use client"
import CurrentInventory from "./stockProducts"
import StockCards from "./cards"
import { useRouter } from "next/navigation"
import { ArrowBack } from "@mui/icons-material"
import { useLocale, useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getAllProducts } from "@/services/salesService"
import { useSession } from "next-auth/react"
import { useState, useMemo } from "react"


const SaleProductClient = () => {
    const router = useRouter()
    const t = useTranslations('sellProduct')
    const tSales = useTranslations('sales')
    const locale = useLocale()
    const { data: session, status } = useSession()
    const companyObj = session?.user?.companies?.[0]
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id)

    const isSessionLoading = status === "loading";

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState({
        column: "Category",
        operator: "contains",
        value: "",
    });

    const { data: products = [], isLoading, isFetching } = useQuery({
        queryKey: ["allProducts", companyId],
        queryFn: () => getAllProducts(companyId),
        enabled: !!companyId && status === "authenticated",
        staleTime: 30_000,               // Consider data fresh for 30s to prevent rapid refetches
        gcTime: 5 * 10 * 1000,         // Keep cache so navigating back is instant
        refetchOnMount: 'always',       // Explicitly re-validate when user enters the page
        refetchOnWindowFocus: 'always', // Re-validate when switching back from another app/tab
        placeholderData: (previousData) => previousData, // Maintain UI stability during background fetches
    })

    // Compute filtered products (without pagination) for the cards and table
    const filteredProducts = useMemo(() => {
        let result = products;

        // 1. Exclude out-of-stock
        result = result.filter(p => (p.Quantity ?? 0) >= 1);

        // 2. Sort by quantity ascending
        result = [...result].sort((a, b) => (a.Quantity ?? 0) - (b.Quantity ?? 0));

        // 3. Role-based/Shop-based filtering (logic shared with cards.jsx)
        const userRole = session?.user?.role?.toLowerCase();
        const isAdmin = userRole === "company_admin";
        const assignedDepartments = session?.user?.assignedDepartments || [];
        const isSalesWorker = assignedDepartments.includes("sales") && !isAdmin;
        const userShopId = session?.user?.shops?.[0];

        if (isSalesWorker && userShopId) {
            result = result.filter(p => p.shopId === userShopId);
        }

        // 4. Search term
        if (search) {
            const term = search.toLowerCase();
            result = result.filter(p =>
                p.ProductName.toLowerCase().includes(term) ||
                p.ProductId.toLowerCase().includes(term)
            );
        }

        // 5. Advanced Filters (Category/Price)
        if (activeFilter.value) {
            if (activeFilter.column === "Price") {
                const val = Number(activeFilter.value);
                result = result.filter(p => {
                    if (activeFilter.operator === ">") return p.Price > val;
                    if (activeFilter.operator === "<") return p.Price < val;
                    if (activeFilter.operator === "==") return p.Price === val;
                    return true;
                });
            } else if (activeFilter.column === "Category") {
                result = result.filter(p =>
                    p.Category.toLowerCase().includes(activeFilter.value.toLowerCase())
                );
            }
        }

        return result;
    }, [products, search, activeFilter, session?.user]);

    // Use a combined loading state for the initial load
    const isInitialLoading = isSessionLoading || (isLoading && products.length === 0);

    return (
        <div className="">
            <button
                onClick={() => router.back()}
                className="group mb-4 flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
                <ArrowBack className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>{tSales('back')}</span>
            </button>
            <br />

            {/* Cards now use the filtered list (but stats are for the WHOLE list, not just 1 page) */}
            <StockCards products={filteredProducts} isLoading={isInitialLoading} />
            <br />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
            </div>
            <br />

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CurrentInventory
                    products={products}
                    filteredProducts={filteredProducts}
                    isLoading={isInitialLoading}
                    search={search}
                    setSearch={setSearch}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                />
            </section>
        </div>
    )
}

export default SaleProductClient
