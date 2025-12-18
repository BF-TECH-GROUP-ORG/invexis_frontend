import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl text-sm">
        <p className="font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 mb-1 last:mb-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: entry.fill }}
              ></span>
              <span className="text-gray-600 dark:text-gray-300">
                {entry.name}:
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white font-mono">
              {entry.name === "Revenue" ? "$" : ""}
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ModernLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div
          key={`item-${index}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const ShopPerformanceSection = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Shop Performance
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revenue vs Inventory Volume by Location
          </p>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={12} // Increased gap
            barSize={32} // Thicker bars
          >
            <defs>
              <pattern
                id="diagonal-stripe"
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <rect width="2" height="6" fill="#081422" opacity="0.1" />
              </pattern>
            </defs>

            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => `$${val / 1000}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => `${val / 1000}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Legend content={<ModernLegend />} />

            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue"
              fill="#081422"
              radius={[12, 12, 12, 12]} // Fully rounded top
              // Add pattern fill via style or separate element if possible?
              // Recharts pattern fill is simplest on 'fill' attr
            />
            {/* Overlay pattern on Revenue */}
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue"
              fill="url(#diagonal-stripe)"
              radius={[12, 12, 12, 12]}
              legendType="none"
              tooltipType="none"
              barSize={32}
              style={{ pointerEvents: "none", position: "absolute" }}
            />

            <Bar
              yAxisId="right"
              dataKey="units"
              name="Stock Volume"
              fill="#ea580c"
              radius={[12, 12, 12, 12]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ShopPerformanceSection;
