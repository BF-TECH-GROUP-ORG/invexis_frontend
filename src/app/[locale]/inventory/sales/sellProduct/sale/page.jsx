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


const SaleProduct = () => {
    const router = useRouter()
    const t = useTranslations('sellProduct')
    const locale = useLocale()
    const { data: session } = useSession()
    const companyObj = session?.user?.companies?.[0]
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id)

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["allProducts", companyId],
        queryFn: () => getAllProducts(companyId),
        enabled: !!companyId,
    })

    return (
        <div className="">
            <button
                onClick={() => router.back()}
                className="group mb-4 flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
                <ArrowBack className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>{useTranslations('sales')('back')}</span>
            </button>
            <br />

            <StockCards products={products} isLoading={isLoading} />
            <br />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">{t('subtitle')}</p>
                </div>
            </div>
            <br />

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CurrentInventory />
            </section>
        </div>
    )
}

export default SaleProduct