"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function ReportCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-5 rounded-xl border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
          <p className="text-2xl font-bold text-[#1F1F1F]">{stat.value}</p>
          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${stat.changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}>
            {stat.changeType === "increase" ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{stat.change}</span>
          </div>
        </div>
        <div className="text-3xl flex items-center">
          {stat.icon}
        </div>
      </div>
    </motion.div>
  );
}