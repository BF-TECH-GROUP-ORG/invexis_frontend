"use client";
import { useMemo } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useLocale, useTranslations } from "next-intl";
import { Coins, TrendingUp, Undo2, Percent } from "lucide-react";

// Removed local Sparkline and CardItem as they are now in StatsCard


const SalesCards = ({ sales = [], isLoading = false }) => {

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    const salesArray = Array.isArray(sales) ? sales : [];

    const getDailyStats = (dateStr) => {
      const daySales = salesArray.filter(sale => new Date(sale.createdAt).toDateString() === dateStr);
      const totalSales = daySales.reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);
      const totalProfit = daySales.reduce((sum, sale) => {
        const saleProfit = sale.items ? sale.items.reduce((itemSum, item) => {
          const cost = parseFloat(item.costPrice) || 0;
          const price = parseFloat(item.unitPrice) || 0;
          const qty = item.quantity || 1;
          return itemSum + ((price - cost) * qty);
        }, 0) : 0;
        return sum + saleProfit;
      }, 0);
      const returnedCount = daySales.filter(sale =>
        sale.isReturned === true || sale.isReturned === "true" || sale.returned === true || sale.returned === "true"
      ).length;
      const discountCount = daySales.filter(sale =>
        (parseFloat(sale.discountTotal) || 0) > 0
      ).length;

      return { totalSales, totalProfit, returnedCount, discountCount };
    };

    const history = last7Days.map(dateStr => ({
      date: dateStr,
      ...getDailyStats(dateStr)
    }));

    const todayStats = history[history.length - 1];
    const yesterdayStats = history[history.length - 2] || { totalSales: 0, totalProfit: 0, returnedCount: 0, discountCount: 0 };

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      today: todayStats,
      history,
      trends: {
        sales: calculateTrend(todayStats.totalSales, yesterdayStats.totalSales),
        profit: calculateTrend(todayStats.totalProfit, yesterdayStats.totalProfit),
        returned: calculateTrend(todayStats.returnedCount, yesterdayStats.returnedCount),
        discounts: calculateTrend(todayStats.discountCount, yesterdayStats.discountCount),
      }
    };
  }, [sales]);

  const locale = useLocale();
  const t = useTranslations("salesHistory.cards");

  const cards = [
    {
      title: t("totalDailySales"),
      value: stats.today.totalSales,
      trend: stats.trends.sales,
      history: stats.history.map(h => ({ value: h.totalSales, name: h.date })),
      Icon: Coins,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "sales",
      isCurrency: true,
    },
    {
      title: t("totalDailyProfit"),
      value: stats.today.totalProfit,
      trend: stats.trends.profit,
      history: stats.history.map(h => ({ value: h.totalProfit, name: h.date })),
      Icon: TrendingUp,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "profit",
      isCurrency: true,
    },
    {
      title: t("returnedProducts"),
      value: stats.today.returnedCount,
      trend: stats.trends.returned,
      history: stats.history.map(h => ({ value: h.returnedCount, name: h.date })),
      Icon: Undo2,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "returned",
      isCurrency: false,
    },
    {
      title: t("discountsApplied"),
      value: stats.today.discountCount,
      trend: stats.trends.discounts,
      history: stats.history.map(h => ({ value: h.discountCount, name: h.date })),
      Icon: Percent,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "discounts",
      isCurrency: false,
    },
  ];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
      {isLoading ? (
        [1, 2, 3, 4].map((i) => (
          <StatsCard key={i} isLoading={true} />
        ))
      ) : (
        cards.map((card, index) => (
          <StatsCard
            key={card.key}
            title={card.title}
            value={card.value}
            trend={card.trend}
            history={card.history}
            icon={card.Icon}
            color={card.color}
            bgColor={card.bgColor}
            isCurrency={card.isCurrency}
            index={index}
            locale={locale}
          />
        ))
      )}
    </div>
  );

}
export default SalesCards;