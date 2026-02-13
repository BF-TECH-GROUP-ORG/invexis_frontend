"use client";

import { motion } from "framer-motion";
import { People, Group, Person, Work } from "@mui/icons-material";
import { useTranslations } from "next-intl";

export default function WorkerCards({ workers = [] }) {
    const t = useTranslations("management.workers");

    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const adminWorkers = workers.filter(w => w.role === 'admin' || w.role === 'company_admin').length;
    const staffWorkers = totalWorkers - adminWorkers;

    const cards = [
        {
            title: t("totalPersonnel") || "Total Personnel",
            value: totalWorkers,
            Icon: People,
            color: "#f97316",
            bgColor: "#fff7ed",
            key: "total",
        },
        {
            title: t("activeStaff") || "Active Staff",
            value: activeWorkers,
            Icon: Person,
            color: "#10b981",
            bgColor: "#ecfdf5",
            key: "active",
        },
        {
            title: t("management") || "Management",
            value: adminWorkers,
            Icon: Work,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            key: "management",
        },
        {
            title: t("operationalStaff") || "Operational Staff",
            value: staffWorkers,
            Icon: Group,
            color: "#8b5cf6",
            bgColor: "#f5f3ff",
            key: "operational",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                <p className="text-sm text-[#6b7280] font-medium mb-1 truncate">
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
