// src/components/sales/SalesCards.jsx
"use client";

import { motion } from "framer-motion";
import { Coins, TrendingUp, Undo2, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getSalesHistory } from "@/services/salesService";
import { useMemo } from "react";

export default function SalesCards() {
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  const { data: sales = [] } = useQuery({
    queryKey: ["salesHistory", companyId],
    queryFn: () => getSalesHistory(companyId),
    enabled: !!companyId,
  });

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(
      sale => new Date(sale.createdAt).toDateString() === today
    );

    return {
      totalDailySales: todaySales.reduce((s, v) => s + (v.totalAmount || 0), 0),
      totalDailyProfit: todaySales.reduce((s, v) => s + (v.profit || 0), 0),
      totalReturned: sales.filter(s => s.returned).length,
      totalDiscounts: sales.filter(s => (s.discountTotal || 0) > 0).length,
    };
  }, [sales]);

  const formatCurrency = amount =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);

  const cards = [
    {
      title: "Total Daily Sales",
      value: formatCurrency(stats.totalDailySales),
      Icon: Coins,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "sales",
    },
    {
      title: "Total Daily Profit",
      value: formatCurrency(stats.totalDailyProfit),
      Icon: TrendingUp,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "profit",
    },
    {
      title: "Returned Products",
      value: stats.totalReturned,
      Icon: Undo2,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "returned",
    },
    {
      title: "Discounts Applied",
      value: stats.totalDiscounts,
      Icon: Percent,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "discounts",
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
                  {card.value}
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
