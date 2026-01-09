"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Coins, TrendingUp, Undo2, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMemo, useEffect } from "react";
import Skeleton from "@/components/shared/Skeleton";

const Counter = ({ value, currency = false }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    if (currency) {
      return new Intl.NumberFormat("en-RW", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
      }).format(current);
    }
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

const Sparkline = ({ data, color }) => (
  <div className="h-16 w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#gradient-${color})`}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

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

  const cards = [
    {
      title: "Total Daily Sales",
      value: stats.today.totalSales,
      trend: stats.trends.sales,
      history: stats.history.map(h => ({ value: h.totalSales })),
      Icon: Coins,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "sales",
      isCurrency: true,
    },
    {
      title: "Total Daily Profit",
      value: stats.today.totalProfit,
      trend: stats.trends.profit,
      history: stats.history.map(h => ({ value: h.totalProfit })),
      Icon: TrendingUp,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "profit",
      isCurrency: true,
    },
    {
      title: "Returned Products",
      value: stats.today.returnedCount,
      trend: stats.trends.returned,
      history: stats.history.map(h => ({ value: h.returnedCount })),
      Icon: Undo2,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "returned",
      isCurrency: false,
    },
    {
      title: "Discounts Applied",
      value: stats.today.discountCount,
      trend: stats.trends.discounts,
      history: stats.history.map(h => ({ value: h.discountCount })),
      Icon: Percent,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "discounts",
      isCurrency: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {isLoading ? (
        [1, 2, 3, 4].map((i) => (
          <div key={i} className="border-2 border-gray-100 rounded-2xl p-5 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))
      ) : (
        cards.map((card, index) => {
          const Icon = card.Icon;
          const isPositive = card.trend >= 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-2 border-[#e5e7eb] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <p className="text-sm text-[#6b7280] font-semibold mb-1 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-extrabold font-jetbrains text-[#111827]">
                      <Counter value={card.value} currency={card.isCurrency} />
                    </p>
                    <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {Math.abs(card.trend).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon size={24} style={{ color: card.color }} />
                </div>
              </div>

              <Sparkline data={card.history} color={card.color} />
            </motion.div>
          );
        })
      )}
    </div>
  );
}
export default SalesCards;