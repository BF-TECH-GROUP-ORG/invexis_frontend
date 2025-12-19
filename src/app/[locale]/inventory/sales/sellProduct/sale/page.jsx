"use client"
import CurrentInventory from "./stockProducts"
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
    const t = useTranslations('sales')
    const locale = useLocale()
    const { data: session } = useSession()
    const companyObj = session?.user?.companies?.[0]
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id)

    const { data: products = [] } = useQuery({
        queryKey: ["allProducts", companyId],
        queryFn: () => getAllProducts(companyId),
        enabled: !!companyId,
    })

    // This state will be managed by CurrentInventory, but for the cards we can derive some stats from the products list
    // To keep it simple and avoid complex state lifting for now, we'll show general stats and 0 for selection-based stats
    // unless we want to lift the selection state. Given the "do not change any logic" constraint, I'll keep it safe.

    const stats = useMemo(() => {
        const total = products.length
        const lowStock = products.filter(p => p.Quantity < 10).length
        const totalValue = products.reduce((sum, p) => sum + (p.Price * p.Quantity), 0)

        return { total, lowStock, totalValue }
    }, [products])

    const statCards = [
        {
            title: "Total Products",
            value: stats.total,
            Icon: Package,
            color: "#3b82f6",
            bgColor: "#eff6ff",
        },
        {
            title: "Low Stock",
            value: stats.lowStock,
            Icon: AlertTriangle,
            color: "#f59e0b",
            bgColor: "#fef3c7",
        },
        {
            title: "Inventory Value",
            value: `${stats.totalValue.toLocaleString()} RWF`,
            Icon: DollarSign,
            color: "#8b5cf6",
            bgColor: "#f3e8ff",
        },
        {
            title: "Active Sale",
            value: "In Progress",
            Icon: ShoppingCart,
            color: "#10b981",
            bgColor: "#ecfdf5",
        },
    ]

    return (
        <div className="p-6 space-y-8 ">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="group mb-4 flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                    >
                        <ArrowBack className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span>{t('back')}</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('saleProducts')}</h1>
                    <p className="text-gray-500 mt-1">{t('saleSubTitile')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.Icon
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                </div>
                                <div
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: card.bgColor }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: card.color }} />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CurrentInventory />
            </section>
        </div>
    )
}

export default SaleProduct