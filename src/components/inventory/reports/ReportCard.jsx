"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Maximize2, Minimize2 } from "lucide-react";

const formatValue = (val, isCompact) => {
  const num = Number(val) || 0;
  if (!isCompact) return num.toLocaleString();

  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
};

export default function ReportCard({
  stat,
  index,
  isCompact = true,
  onToggleCompact,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-5 rounded-xl border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm text-gray-600 mb-1 truncate">{stat.title}</h3>
          <div className="flex items-center gap-2">
            <p
              className={`font-bold text-[#1F1F1F] transition-all ${
                stat.isMoney && !isCompact && stat.value.toString().length > 10
                  ? "text-xl"
                  : "text-2xl"
              }`}
            >
              {stat.isMoney ? `$${formatValue(stat.value, isCompact)}` : stat.value}
            </p>
            {stat.isMoney && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompact();
                }}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors"
                title={isCompact ? "Show full value" : "Show compact value"}
              >
                {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
            )}
          </div>
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