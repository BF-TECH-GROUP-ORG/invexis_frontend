"use client";

import { useMemo } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowLeftRight,
    CheckCircle2,
    Clock,
    Package
} from "lucide-react";

const TransferStats = ({ stats = {} }) => {
    const locale = useLocale();
    const t = useTranslations("transfers.stats");

    // Mock history data for sparklines
    const mockHistory = (baseValue) => {
        return Array.from({ length: 7 }, (_, i) => ({
            name: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: Math.floor(baseValue * (0.8 + Math.random() * 0.4))
        }));
    };

    const cards = useMemo(() => [
        {
            title: t("totalTransfers"),
            value: stats.total || 0,
            trend: 12.5,
            history: mockHistory(stats.total || 10),
            icon: ArrowLeftRight,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            key: "total",
        },
        {
            title: t("completed"),
            value: stats.completed || 0,
            trend: 8.2,
            history: mockHistory(stats.completed || 8),
            icon: CheckCircle2,
            color: "#10b981",
            bgColor: "#ecfdf5",
            key: "completed",
        },
        {
            title: t("stockMoved"),
            value: stats.totalQuantity || 0,
            trend: 15.4,
            history: mockHistory(stats.totalQuantity || 200),
            icon: Package,
            color: "#f59e0b",
            bgColor: "#fef3c7",
            key: "stock",
            isCurrency: false,
        },
        {
            title: t("recentActiveDays"),
            value: stats.latestDay || 0,
            trend: -5.0,
            history: mockHistory(stats.latestDay || 3),
            icon: Clock,
            color: "#8b5cf6",
            bgColor: "#f3e8ff",
            key: "activity",
        },
    ], [stats]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
            {cards.map((card, index) => (
                <StatsCard
                    key={card.key}
                    title={card.title}
                    value={card.value}
                    trend={card.trend}
                    history={card.history}
                    icon={card.icon}
                    color={card.color}
                    bgColor={card.bgColor}
                    isCurrency={card.isCurrency}
                    index={index}
                    locale={locale}
                />
            ))}
        </div>
    );
};

export default TransferStats;
