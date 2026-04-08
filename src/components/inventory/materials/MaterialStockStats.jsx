import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Database,
  Maximize2,
  Minimize2,
  Layers
} from "lucide-react";

/**
 * MaterialStockStats - Specialized analytics for non-saleable items
 */
export default function MaterialStockStats({ stats, isMounted }) {
  const t = useTranslations("materials.stats");
  const [isCompact, setIsCompact] = useState(true);

  const formatValue = (value) => {
    const num = Number(value) || 0;
    if (!isCompact) return num.toLocaleString();
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };

  const statCards = [
    {
      title: t("total"),
      value: stats.total || 0,
      Icon: Layers,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "total",
    },
    {
      title: t("stock"),
      value: stats.inStock || 0,
      Icon: Database,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "stock",
    },
    {
      title: t("lowStock"),
      value: stats.lowStock || 0,
      Icon: AlertTriangle,
      color: "#f59e0b",
      bgColor: "#fef3c7",
      key: "low_stock",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.Icon;
        const displayValue = !isMounted
          ? "..."
          : (card.isCurrency
            ? `${formatValue(card.value)} RWF`
            : card.value.toLocaleString());

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative border border-gray-200 rounded-2xl p-5 bg-white hover:border-[#081422] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm text-[#6b7280] font-medium mb-1 truncate">
                  {card.title}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`font-bold font-jetbrains text-[#081422] transition-all ${displayValue.length > 12 ? "text-lg" : "text-2xl"
                      }`}
                  >
                    {displayValue}
                  </div>
                  {card.hasToggle && (
                    <button
                      onClick={() => setIsCompact(!isCompact)}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
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
