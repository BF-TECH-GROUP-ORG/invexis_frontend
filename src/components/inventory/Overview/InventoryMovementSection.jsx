import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
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
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-gray-600 dark:text-gray-300">
                {entry.name}
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white font-mono">
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

const InventoryMovementSection = ({ data = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Inventory Movement Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stock In vs. Stock Out analysis over time
          </p>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          >
            <defs>
              <pattern
                id="striped-pattern"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
                patternTransform="rotate(45)"
              >
                <rect
                  width="2"
                  height="4"
                  transform="translate(0,0)"
                  fill="#081422"
                  opacity="0.1"
                />
              </pattern>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
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
              tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
            />
            <Legend content={<ModernLegend />} />

            <Bar
              dataKey="stockIn"
              name="Stock In"
              barSize={32}
              fill="url(#barGradient)"
              radius={[12, 12, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="stockOut"
              name="Stock Out"
              barSize={32}
              fill="#081422" // Dark fill
              radius={[4, 4, 12, 12]} // Bottom rounded for stacked look if needed, or top if separate
              // Note: If separate stacks, radius should be top.
              // User asked for "add line shades... make the design look sleek".
              // Let's overlay a pattern on the dark bar.
            >
              {data.map((entry, index) => (
                <Rectangle
                  key={`rect-${index}`}
                  fill="#081422"
                  stroke="none"
                  radius={[12, 12, 0, 0]}
                />
              ))}
            </Bar>
            {/* Overlay pattern for stockOut for texture */}
            <Bar
              dataKey="stockOut"
              name="Stock Out"
              barSize={32}
              fill="url(#striped-pattern)"
              radius={[12, 12, 0, 0]}
              legendType="none" // Hide from legend
              tooltipType="none"
              style={{ pointerEvents: "none" }}
            />

            <Line
              type="monotone"
              dataKey="netChange"
              name="Net Change"
              stroke="#fb923c"
              strokeWidth={4}
              dot={{ r: 6, fill: "#fff", strokeWidth: 3, stroke: "#fb923c" }}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#ea580c" }}
              strokeDasharray="0 0" // Solid bold line
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryMovementSection;
