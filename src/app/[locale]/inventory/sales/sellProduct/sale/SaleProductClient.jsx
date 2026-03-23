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

            <StockCards products={products} isLoading={isInitialLoading} />
            <br />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
            </div>
            <br />

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CurrentInventory products={products} isLoading={isInitialLoading} />
            </section>
        </div>
    )
}

export default SaleProductClient
