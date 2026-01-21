"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingCart, DollarSign, AlertTriangle, Maximize2, Minimize2 } from "lucide-react";
import { useMemo, useState } from "react";
import Skeleton from "@/components/shared/Skeleton";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";

const CardItem = ({ card, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const Icon = card.Icon;
    const locale = useLocale();

    const displayValue = useMemo(() => {
        if (typeof card.value === 'string' && !card.isCurrency) return card.value;

        if (isExpanded) {
            if (card.isCurrency) {
                return new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "RWF",
                    maximumFractionDigits: 0,
                }).format(card.value);
            }
            return new Intl.NumberFormat(locale).format(card.value);
        }

        if (card.isCurrency) {
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "RWF",
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 1,
            }).format(card.value);
        }

        return new Intl.NumberFormat(locale, {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1,
        }).format(card.value);
    }, [isExpanded, card.value, card.isCurrency, locale]);

    const showToggle = typeof card.value === 'number' && card.value >= 1000;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, layout: { duration: 0.3, type: "spring" } }}
            className="border-2 border-[#e5e7eb] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-colors hover:shadow-lg group"
        >
            <div className="flex items-start justify-between">
                <div className="flex-grow">
                    <motion.p layout="position" className="text-sm text-[#6b7280] font-semibold mb-1 uppercase tracking-wider">
                        {card.title}
                    </motion.p>
                    <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isExpanded ? "expanded" : "compact"}
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="text-2xl font-extrabold font-jetbrains text-[#111827]"
                            >
                                {displayValue}
                            </motion.div>
                        </AnimatePresence>

                        {showToggle && (
                            <motion.button
                                layout
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md"
                            >
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </motion.button>
                        )}
                    </div>
                </div>

                <motion.div
                    layout
                    className="p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: card.bgColor }}
                >
                    <Icon size={24} style={{ color: card.color }} />
                </motion.div>
            </div>
        </motion.div>
    );
};

const StockCards = ({ products = [], isLoading = false }) => {
    const { data: session } = useSession();
    const t = useTranslations('sellProduct.cards');
    const locale = useLocale();

    const stats = useMemo(() => {
        // Role-based filtering for stats
        const userRole = session?.user?.role;
        const assignedDepartments = session?.user?.assignedDepartments || [];
        const isSalesWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";
        const userShopId = session?.user?.shops?.[0];

        let filteredForStats = products;
        if (isSalesWorker && userShopId) {
            filteredForStats = products.filter(p => p.shopId === userShopId);
        }

        const total = filteredForStats.length;
        const lowStock = filteredForStats.filter(p => p.Quantity < 10).length;
        const totalValue = filteredForStats.reduce((sum, p) => sum + (p.Price * p.Quantity), 0);

        return { total, lowStock, totalValue };
    }, [products, session?.user]);

    const cards = [
        {
            title: t('totalProducts'),
            value: stats.total,
            Icon: Package,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            key: "total",
            isCurrency: false,
        },
        {
            title: t('lowStock'),
            value: stats.lowStock,
            Icon: AlertTriangle,
            color: "#f59e0b",
            bgColor: "#fef3c7",
            key: "lowStock",
            isCurrency: false,
        },
        {
            title: t('inventoryValue'),
            value: stats.totalValue,
            Icon: DollarSign,
            color: "#8b5cf6",
            bgColor: "#f3e8ff",
            key: "value",
            isCurrency: true,
        },
        {
            title: t('activeSale'),
            value: t('inProgress'),
            Icon: ShoppingCart,
            color: "#10b981",
            bgColor: "#ecfdf5",
            key: "status",
            isCurrency: false,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-2 border-gray-100 rounded-2xl p-5 bg-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16 mb-1" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                    </div>
                ))
            ) : (
                cards.map((card, index) => (
                    <CardItem key={card.key} card={card} index={index} />
                ))
            )}
        </div>
    );
};

export default StockCards;
