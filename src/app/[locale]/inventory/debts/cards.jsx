"use client";

import { Scale, ShieldCheck, CalendarClock, BadgeCheck } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { StatsCard } from "@/components/shared/StatsCard";
import { useLocale } from "next-intl";

// Removing local CardItem and Sparkline as we use the shared StatsCard


const DebtCards = ({ debts = [], isLoading = false }) => {
  const t = useTranslations("debtsPage");

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    const debtsArray = Array.isArray(debts) ? debts : [];

    const getDailyStats = (dateStr) => {
      const dayDebts = debtsArray.filter(debt => new Date(debt.createdAt).toDateString() === dateStr);

      const totalAmount = dayDebts.reduce((sum, debt) => sum + (parseFloat(debt.totalAmount) || 0), 0);
      const paidCount = dayDebts.filter(debt => (debt.status || "").toUpperCase() === "PAID").length;
      const totalRemaining = dayDebts.reduce((sum, debt) => sum + (parseFloat(debt.balance) || 0), 0);
      const totalDebts = dayDebts.length;

      return { totalAmount, paidCount, totalRemaining, totalDebts };
    };

    const history = last7Days.map(dateStr => ({
      date: dateStr,
      ...getDailyStats(dateStr)
    }));

    const totalStats = {
      totalAmount: debtsArray.reduce((s, d) => s + parseFloat(d.totalAmount || 0), 0),
      totalRemaining: debtsArray.reduce((s, d) => s + parseFloat(d.balance || 0), 0),
      paidCount: debtsArray.filter(d => (d.status || "").toUpperCase() === "PAID").length,
      totalDebts: debtsArray.length,
    };

    const todayStats = history[history.length - 1];
    const yesterdayStats = history[history.length - 2] || { totalAmount: 0, paidCount: 0, totalRemaining: 0, totalDebts: 0 };

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totals: totalStats,
      history,
      trends: {
        amount: calculateTrend(todayStats.totalAmount, yesterdayStats.totalAmount), // Trend of DAILY creation
        remaining: calculateTrend(todayStats.totalRemaining, yesterdayStats.totalRemaining),
        paid: calculateTrend(todayStats.paidCount, yesterdayStats.paidCount),
        count: calculateTrend(todayStats.totalDebts, yesterdayStats.totalDebts),
      }
    };
  }, [debts]);

  const cards = [
    {
      title: t("totalDebts"),
      value: stats.totals.totalAmount,
      trend: stats.trends.amount,
      history: stats.history.map(h => ({ value: h.totalAmount, name: h.date })),
      Icon: Scale,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "total",
      isCurrency: true,
    },
    {
      title: t("clearedDebts"),
      value: stats.totals.paidCount,
      trend: stats.trends.paid,
      history: stats.history.map(h => ({ value: h.paidCount, name: h.date })),
      Icon: ShieldCheck,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "paid",
      isCurrency: false,
    },
    {
      title: t("upcomingPayments"),
      value: stats.totals.totalRemaining,
      trend: stats.trends.remaining,
      history: stats.history.map(h => ({ value: h.totalRemaining, name: h.date })),
      Icon: CalendarClock,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "remaining",
      isCurrency: true,
    },
    {
      title: t("verifiedDebtors"),
      value: stats.totals.totalDebts,
      trend: stats.trends.count,
      history: stats.history.map(h => ({ value: h.totalDebts, name: h.date })),
      Icon: BadgeCheck,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "verified",
      isCurrency: false,
    },
  ];

  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

export default DebtCards;
