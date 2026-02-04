import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-xs">
        <p className="font-semibold text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ModernLegend = ({ payload, t }) => {
  return (
    <div className="flex justify-center gap-6 mt-6">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-1.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const InventoryMovementSection = ({ data = [] }) => {
  const t = useTranslations("inventoryOverview.movement");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            {t("title")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          >
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dx={-15}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<ModernLegend t={t} />} />

            <Area
              type="monotone"
              name={t("stockIn")}
              dataKey="stockIn"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorIn)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              name={t("stockOut")}
              dataKey="stockOut"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#colorOut)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              name={t("netChange")}
              dataKey="netChange"
              stroke="#6366f1"
              fillOpacity={0}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryMovementSection;
