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
    },
    {
      title: "In Stock",
      value: stats.inStock || 0,
      Icon: TrendingUp,
    },
    {
      title: "Low Stock",
      value: stats.lowStock || 0,
      Icon: AlertTriangle,
    },
    {
      title: "Total Value",
      value: stats.totalValue
        ? `$${Number(stats.totalValue).toLocaleString()}`
        : "$0",
      Icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-[#E5E5E5] rounded-xl p-6 hover:border-[#EA580C] transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Text on the LEFT */}
            <div>
              <h3 className="text-sm font-medium text-[#333]">{stat.title}</h3>
              <p className="text-3xl font-bold text-[#1F1F1F] mt-2">
                {stat.value}
              </p>
            </div>

            {/* Icon on the RIGHT – NO gray circle, NO shadow */}
            <div className="flex items-center">
              <stat.Icon size={36} className="text-[#F97316]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}