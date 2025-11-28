"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import PeriodToggle from "./PeriodToggle";
import DateRangeInput from "./DateRangeInput";

const PRIMARY_COLORS = {
  orange: "#ff782d",
  purple: "#a855f7",
  blue: "#3b82f6",
};

export default function SalesAnalyticsChart({
  data,
  period = "6M",
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  // replace tier-based series with product channel series
  const sample = data ?? [
    { label: "Jan", Online: 4000, Retail: 2400, Wholesale: 2400 },
    { label: "Feb", Online: 3000, Retail: 1398, Wholesale: 2210 },
    { label: "Mar", Online: 2000, Retail: 9800, Wholesale: 2290 },
    { label: "Apr", Online: 2780, Retail: 3908, Wholesale: 2000 },
    { label: "May", Online: 1890, Retail: 4800, Wholesale: 2181 },
    { label: "Jun", Online: 2390, Retail: 3800, Wholesale: 2500 },
  ];

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            Sales Analytics by Channel
          </h2>
          <p className="text-sm text-neutral-500">
            Track sales across channels (Online, Retail, Wholesale)
          </p>
        </div>
        <PeriodToggle value={period} onChange={onPeriodChange} />
      </div>

      <DateRangeInput
        startDate={startDate}
        endDate={endDate}
        onStartChange={onStartDateChange}
        onEndChange={onEndDateChange}
      />

      <div className="w-full h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sample}
            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id="colorOnlineGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.orange}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.orange}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="colorRetailGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.purple}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.purple}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="colorWholesaleGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.blue}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.blue}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "13px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
              }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
            <Area
              type="natural"
              dataKey="Online"
              stroke={PRIMARY_COLORS.orange}
              strokeWidth={3}
              fill="url(#colorOnlineGradient)"
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Area
              type="natural"
              dataKey="Retail"
              stroke={PRIMARY_COLORS.purple}
              strokeWidth={3}
              fill="url(#colorRetailGradient)"
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Area
              type="natural"
              dataKey="Wholesale"
              stroke={PRIMARY_COLORS.blue}
              strokeWidth={3}
              fill="url(#colorWholesaleGradient)"
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
