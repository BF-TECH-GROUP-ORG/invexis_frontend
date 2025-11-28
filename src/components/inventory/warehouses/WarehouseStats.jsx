"use client";

import { MapPin, Package, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function WarehouseStats({ stats }) {
  const statCards = [
    {
      title: "Total Warehouses",
      value: stats.total,
      icon: <MapPin className="text-blue-500" size={32} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Active Warehouses",
      value: stats.active,
      icon: <Activity className="text-green-500" size={32} />,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Total Capacity",
      value: `${stats.totalCapacity.toLocaleString()} m³`,
      icon: <Package className="text-orange-500" size={32} />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Utilization Rate",
      value: `${stats.utilizationRate}%`,
      icon: <TrendingUp className="text-purple-500" size={32} />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
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
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className={`${stat.bgColor} p-3 rounded-lg w-fit mb-4`}>
            {stat.icon}
          </div>
          <h3 className="text-sm text-gray-500 mb-1">{stat.title}</h3>
          <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}