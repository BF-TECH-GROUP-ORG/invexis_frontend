// src/app/[locale]/inventory/companies/cards.jsx
"use client";

import { motion } from "framer-motion";
import { Business, LocationOn, People } from "@mui/icons-material";
import { useTranslations } from "next-intl";

export default function CompanyCards({ stats }) {
  const t = useTranslations("management.companies");

  const cards = [
    {
      title: t("totalShops") || "Total Shops",
      value: stats.totalBranches || 0,
      Icon: Business,
      color: "#f97316",
      bgColor: "#fff7ed",
      key: "total",
    },
    {
      title: t("activeShops") || "Active Shops",
      value: stats.activeBranches || 0,
      Icon: LocationOn,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "active",
    },
    {
      title: t("totalCapacity") || "Total Capacity",
      value: stats.totalCapacity || 0,
      Icon: People,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "capacity",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = card.Icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative overflow-hidden border-2 border-[#f3f4f6] rounded-2xl p-4 md:p-5 bg-white hover:border-[#ff782d] transition-all hover:shadow-md group"
          >
            {/* Background Accent */}
            <div
              className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"
              style={{ color: card.color }}
            >
              <Icon sx={{ fontSize: 100 }} />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-[#6b7280] font-semibold uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl md:text-3xl font-black font-jetbrains text-[#081422]">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
              </div>

              <div
                className="p-3 md:p-4 rounded-2xl shrink-0 shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon sx={{ fontSize: { xs: 24, md: 32 }, color: card.color }} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
