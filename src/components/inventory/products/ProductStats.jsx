// src/components/inventory/products/ProductStats.jsx
"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

export default function ProductStats({ stats }) {
  const statCards = [
    {
      title: "All Products",
      value: stats.total || 0,
      Icon: Package,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "total",
    },
    {
      title: "In Stock",
      value: stats.inStock || 0,
      Icon: TrendingUp,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "stock",
    },
    {
      title: "Low Stock",
      value: stats.lowStock || 0,
      Icon: AlertTriangle,
      color: "#f59e0b",
      bgColor: "#fef3c7",
      key: "low_stock",
    },
    {
      title: "Total Value",
      value: stats.totalValue
        ? `$${Number(stats.totalValue).toLocaleString()}`
        : "$0",
      Icon: DollarSign,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "value",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
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
                <p className="text-2xl font-bold text-[#081422] mb-2">
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
