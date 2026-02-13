import React from 'react';
import { Store, Boxes, TrendingUp, Coins } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { StatsCard } from '@/components/shared/StatsCard';
import { getCachedSummary, getCachedSales, getCachedProfitability, getCachedTopProducts } from '@/services/dashboardCache';
import dayjs from 'dayjs';

export default async function StatsCardsSection({ companyId, params, options, locale }) {
    const t = await getTranslations({ locale, namespace: 'dashboard' });

    // Parallel data fetching for stats
    const [summaryRes, salesRes, profitabilityRes, productsRes] = await Promise.all([
        getCachedSummary(companyId, params, options),
        getCachedSales(companyId, params, options),
        getCachedProfitability(companyId, params, options),
        getCachedTopProducts(companyId, params, options)
    ]);

    const summary = summaryRes?.data || summaryRes || {};
    const rawSales = salesRes?.data || salesRes || [];
    const rawProfitability = profitabilityRes?.data || profitabilityRes || [];
    const rawProducts = productsRes?.data || productsRes || [];

    // Data transformation for sparklines
    const salesHistory = rawSales.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        value: parseFloat(item.revenue) || 0
    }));

    const profitHistory = rawProfitability.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        value: parseFloat(item.profit) || 0
    }));

    const ordersHistory = rawSales.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        value: parseInt(item.orderCount) || 0
    }));

    const productsHistory = rawProducts.slice(0, 5).map(item => ({
        name: item.productName || 'Unknown',
        value: parseInt(item.totalQuantity) || 0
    }));

    const cards = [
        {
            title: t("totalSales"),
            value: parseFloat(summary.totalDailySales) || 0,
            icon: <Coins size={24} style={{ color: "#8b5cf6" }} />,
            color: "#8b5cf6",
            bgColor: "#f3e8ff",
            isCurrency: true,
            history: salesHistory
        },
        {
            title: t("totalProfit"),
            value: parseFloat(summary.totalDailyProfit) || 0,
            icon: <TrendingUp size={24} style={{ color: "#10b981" }} />,
            color: "#10b981",
            bgColor: "#ecfdf5",
            isCurrency: true,
            history: profitHistory
        },
        {
            title: t("totalOrders"),
            value: parseInt(summary.totalOrders) || 0,
            icon: <Store size={24} style={{ color: "#ea580c" }} />,
            color: "#ea580c",
            bgColor: "#fff7ed",
            history: ordersHistory
        },
        {
            title: t("topProduct"),
            value: rawProducts.length > 0 ? rawProducts[0].totalQuantity : 0,
            icon: <Boxes size={24} style={{ color: "#3b82f6" }} />,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            history: productsHistory
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <StatsCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    color={card.color}
                    bgColor={card.bgColor}
                    isCurrency={card.isCurrency}
                    history={card.history}
                    index={index}
                    locale={locale}
                />
            ))}
        </div>
    );
}
