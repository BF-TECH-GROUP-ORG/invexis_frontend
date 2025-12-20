// src/components/debts/DebtCards.jsx
"use client";

import { motion } from "framer-motion";
import { Scale, ShieldCheck, CalendarClock, BadgeCheck, Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const DebtCardItem = ({ title, rawValue, Icon, color, bgColor, index, isCurrency }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat("en-RW", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(number);
  };

  const displayValue = isExpanded
    ? (isCurrency ? formatCurrency(rawValue) : rawValue)
    : (isCurrency ? formatCompactNumber(rawValue) : rawValue);

  const showToggle = isCurrency && rawValue >= 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.1 }}
      className="border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-colors hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6b7280] font-medium mb-1">
            {title}
          </p>
          <div className="flex items-center gap-2 h-8">
            <motion.p
              key={isExpanded ? "expanded" : "compact"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold font-jetbrains text-[#081422]"
            >
              {displayValue}
            </motion.p>
            {showToggle && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md"
                title={isExpanded ? "Show compact view" : "Show precise view"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </motion.button>
            )}
          </div>
        </div>

        <div
          className="p-3 rounded-xl shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={24} style={{ color: color }} />
        </div>
      </div>
    </motion.div>
  );
};

export default function DebtCards({ debts = [] }) {
  const t = useTranslations("debtsPage");

  const stats = {
    totalAmount: debts.reduce((s, d) => s + (d.totalAmount || 0), 0),
    totalRemaining: debts.reduce((s, d) => s + (d.balance || 0), 0),
    paidCount: debts.filter(d => d.status === "PAID").length,
    totalDebts: debts.length,
  };

  const cards = [
    {
      title: t("totalDebts"),
      rawValue: stats.totalAmount,
      Icon: Scale,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "total",
      isCurrency: true,
    },
    {
      title: t("clearedDebts"),
      rawValue: stats.paidCount,
      Icon: ShieldCheck,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "paid",
      isCurrency: false,
    },
    {
      title: t("upcomingPayments"),
      rawValue: stats.totalRemaining,
      Icon: CalendarClock,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "remaining",
      isCurrency: true,
    },
    {
      title: t("verifiedDebtors"),
      rawValue: stats.totalDebts,
      Icon: BadgeCheck,
      color: "#ef4444",
      bgColor: "#fee2e2",
      key: "verified",
      isCurrency: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <DebtCardItem
          key={card.key}
          {...card}
          index={index}
        />
      ))}
    </div>
  );
}
