"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function ReportCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-5 justify-between flex rounded-xl border hover:shadow-md transition-shadow"
    >
      <div className="flex h-full items-center">
        <div className="text-orange-500 text-3xl">
          {stat.icon}
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-1 mb-1">
          <div className={`flex items-center gap-1 text-xs font-medium ${stat.changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}>
            {stat.changeType === "increase" ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{stat.change}</span>
          </div>
        </div>
        <p className="text-2xl font-bold">{stat.value}</p>
        <h3 className="text-sm text-gray-600">{stat.title}</h3>
      </div>
    </motion.div>
  );
}