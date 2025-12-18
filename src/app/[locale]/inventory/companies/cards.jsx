// src/components/company/CompanyCards.jsx
"use client";

import { motion } from "framer-motion";
import { Business, LocationOn, People } from "@mui/icons-material";

export default function CompanyCards({ stats }) {
  const cards = [
    {
      title: "Total Shops",
      value: stats.totalBranches || 0,
      Icon: Business,
      color: "#f97316",
      bgColor: "#fff7ed",
      key: "total",
    },
    {
      title: "Active Shops",
      value: stats.activeBranches || 0,
      Icon: LocationOn,
      color: "#10b981",
      bgColor: "#ecfdf5",
      key: "active",
    },
    {
      title: "Total Capacity",
      value: stats.totalCapacity || 0,
      Icon: People,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      key: "capacity",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Icon sx={{ fontSize: 24, color: card.color }} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
