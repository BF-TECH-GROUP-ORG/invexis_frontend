"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { Coins, TrendingUp, Undo2, Percent } from "lucide-react";
import { useMemo, useEffect } from "react";

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

const SalesCards = ({ sales = [] }) => {

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    // Filter sales for today
    const todaySales = sales.filter(sale =>
      new Date(sale.createdAt).toDateString() === today
    );

    const totalDailySales = todaySales.reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);

    // Calculate profit based on items
    const totalDailyProfit = todaySales.reduce((sum, sale) => {
      const saleProfit = sale.items ? sale.items.reduce((itemSum, item) => {
        const cost = parseFloat(item.costPrice) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        const qty = item.quantity || 1;
        return itemSum + ((price - cost) * qty);
      }, 0) : 0;
      return sum + saleProfit;
    }, 0);

    const totalReturned = sales.filter(sale =>
      sale.isReturned === true || sale.isReturned === "true" || sale.returned === true || sale.returned === "true"
    ).length;

    const totalDiscounts = sales.filter(sale =>
      (parseFloat(sale.discountTotal) || 0) > 0
    ).length;

    return {
      totalDailySales,
      totalDailyProfit,
      totalReturned,
      totalDiscounts,
    };
  }, [sales]);

  const cards = [
    {
      title: "Total Daily Sales",
      value: stats.totalDailySales,
      Icon: Coins,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "sales",
      isCurrency: true,
    },
    {
      title: "Total Daily Profit",
      value: stats.totalDailyProfit,
      Icon: TrendingUp,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "profit",
      isCurrency: true,
    },
    {
      title: "Returned Products",
      value: stats.totalReturned,
      Icon: Undo2,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "returned",
      isCurrency: false,
    },
    {
      title: "Discounts Applied",
      value: stats.totalDiscounts,
      Icon: Percent,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "discounts",
      isCurrency: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.Icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b7280] font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold font-jetbrains text-[#081422]">
                  <Counter value={card.value} currency={card.isCurrency} />
                </p>
              </div>

              <div
                className="p-3 rounded-xl shrink-0"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
export default SalesCards
