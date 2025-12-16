// src/components/debts/DebtCards.jsx
"use client";

import { motion } from "framer-motion";
import { Scale, ShieldCheck, CalendarClock, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DebtCards({ debts = [] }) {
  const t = useTranslations("debtsPage");

  const stats = {
    totalAmount: debts.reduce((s, d) => s + (d.totalAmount || 0), 0),
    totalRemaining: debts.reduce((s, d) => s + (d.balance || 0), 0),
    paidCount: debts.filter(d => d.status === "PAID").length,
    totalDebts: debts.length,
  };

  const formatCurrency = amount =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);

  const cards = [
    {
      title: t("totalDebts"),
      value: formatCurrency(stats.totalAmount),
      Icon: Scale,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "total",
    },
    {
      title: t("clearedDebts"),
      value: stats.paidCount,
      Icon: ShieldCheck,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "paid",
    },
    {
      title: t("upcomingPayments"),
      value: formatCurrency(stats.totalRemaining),
      Icon: CalendarClock,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "remaining",
    },
    {
      title: t("verifiedDebtors"),
      value: stats.totalDebts,
      Icon: BadgeCheck,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "verified",
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
