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

const HeatmapCell = ({ value, day, time }) => {
  let colorClass =
    "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700";
  // Slightly more vibrant Orange scale
  if (value > 80) colorClass = "bg-orange-600";
  else if (value > 60) colorClass = "bg-orange-500";
  else if (value > 40) colorClass = "bg-orange-400";
  else if (value > 20) colorClass = "bg-orange-300";
  else if (value > 0) colorClass = "bg-orange-100";

  return (
    <div
      className={`w-full aspect-square rounded-xl ${colorClass} transition-all hover:scale-105 hover:shadow-lg cursor-pointer relative group`}
    >
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs p-3 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              value > 40 ? "bg-orange-500" : "bg-gray-500"
            }`}
          ></div>
          <span className="font-bold">
            {day} - {time}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-400">Activity Score:</span>
          <span className="font-mono font-bold">{value}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Transactions:</span>
          <span className="font-mono">{Math.floor(value * 1.5)}</span>
        </div>
      </div>
    </div>
  );
};

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl text-sm">
        <p className="font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.stroke }}
            ></span>
            <span className="text-gray-600 dark:text-gray-300 w-20">
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const InventoryInsightsSection = ({ financialData = [], heatmapData = [] }) => {
  const chartHeatmap =
    heatmapData.length > 0
      ? heatmapData
      : Array.from({ length: 28 }).map(() => 0);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = ["Morning", "Noon", "Evening", "Night"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Heatmap Panel */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Activity Heatmap
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Inventory movement intensity by day
        </p>

        <div className="flex">
          <div className="flex flex-col justify-between pr-3 text-xs text-gray-400 font-bold py-2">
            {times.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2">
            {chartHeatmap.map((val, i) => {
              const dayIndex = i % 7;
              const timeIndex = Math.floor(i / 7);
              return (
                <HeatmapCell
                  key={i}
                  value={val}
                  day={days[dayIndex]}
                  time={times[timeIndex]}
                />
              );
            })}
          </div>
        </div>
        <div className="flex justify-between mt-4 px-2 text-xs text-gray-400 font-bold">
          {days.map((d) => (
            <span key={d}>{d[0]}</span>
          ))}
        </div>
      </div>

      {/* Profit & Cost Trend Panel */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Profit & Cost Analysis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Revenue vs Expenses
            </p>
          </div>
          <div className="flex gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Revenue
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 border-l border-gray-200 dark:border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#081422]"></span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Cost
              </span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={financialData}
              margin={{ top: 10, right: 10, bottom: 30, left: 0 }}
            >
              <defs>
                <pattern
                  id="dots-pattern"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <circle cx="2" cy="2" r="1" fill="#081422" opacity="0.1" />
                </pattern>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#081422" stopOpacity={0.3} />
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
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomAreaTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ea580c"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#081422"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorCost)"
              />
              {/* Texture overlay for Cost */}
              <Area
                type="monotone"
                dataKey="cost"
                stroke="none"
                fillOpacity={1}
                fill="url(#dots-pattern)"
                tooltipType="none"
                legendType="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InventoryInsightsSection;
