import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl text-sm">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#081422]"></span>
          <span className="text-gray-600 dark:text-gray-300">Total Value:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            ${payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const InventoryValueTrendSection = ({ data = [] }) => {
  const chartData =
    data.length > 0
      ? data
      : Array.from({ length: 12 }).map((_, i) => ({
          month: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ][i],
          value: 500000 + Math.random() * 200000,
        }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Inventory Value Over Time
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total valuation trend (FIFO)
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#081422" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#081422" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => `$${val / 1000}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#081422",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#081422"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryValueTrendSection;
