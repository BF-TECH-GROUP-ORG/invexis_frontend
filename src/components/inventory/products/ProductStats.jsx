import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Maximize2,
  Minimize2,
} from "lucide-react";

const formatValue = (value, isCompact) => {
  const num = Number(value) || 0;
  if (!isCompact) return num.toLocaleString();

  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
};

export default function ProductStats({ stats }) {
  const [isCompact, setIsCompact] = useState(true);

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
      value: stats.totalValue || 0,
      Icon: DollarSign,
      color: "#8b5cf6",
      bgColor: "#f3e8ff",
      key: "value",
      isCurrency: true,
      hasToggle: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.Icon;
        const displayValue = card.isCurrency
          ? `$${formatValue(card.value, isCompact)}`
          : card.value.toLocaleString();

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm text-[#6b7280] font-medium mb-1 truncate">
                  {card.title}
                </p>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold font-jetbrains text-[#081422] transition-all ${
                      displayValue.length > 12 ? "text-lg" : "text-2xl"
                    }`}
                  >
                    {displayValue}
                  </p>
                  {card.hasToggle && (
                    <button
                      onClick={() => setIsCompact(!isCompact)}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title={
                        isCompact ? "Show full value" : "Show compact value"
                      }
                    >
                      {isCompact ? (
                        <Maximize2 size={14} />
                      ) : (
                        <Minimize2 size={14} />
                      )}
                    </button>
                  )}
                </div>
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
