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
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-gray-600 dark:text-gray-300">
                {entry.name}
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white font-mono">
              {entry.value}
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

const InventoryHealthSection = ({ data = [] }) => {
  const chartData =
    data && data.length > 0
      ? data
      : [{ month: "Now", inStock: 0, lowStock: 0, outOfStock: 0 }];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Stock Status History
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historical view of check-ins vs shortages
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={50} // Thicker bars
          >
            <defs>
              <pattern
                id="lines-pattern"
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <rect
                  width="3"
                  height="6"
                  transform="translate(0,0)"
                  fill="#3b82f6"
                  opacity="0.15"
                />
              </pattern>
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
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Legend content={<ModernLegend />} />

            <Bar
              dataKey="inStock"
              stackId="a"
              fill="#3b82f6"
              name="In Stock"
              radius={[0, 0, 0, 0]}
            />
            {/* Texture overlay for In Stock */}
            <Bar
              dataKey="inStock"
              stackId="b"
              fill="url(#lines-pattern)"
              name="In Stock"
              legendType="none"
              tooltipType="none"
              style={{
                pointerEvents: "none",
                position: "absolute",
                zIndex: 10,
              }}
              barSize={40}
              radius={[0, 0, 0, 0]}
            />

            <Bar
              dataKey="lowStock"
              stackId="a"
              fill="#ea580c"
              name="Low Stock"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="outOfStock"
              stackId="a"
              fill="#ef4444"
              name="Out of Stock"
              radius={[30, 30, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryHealthSection;
