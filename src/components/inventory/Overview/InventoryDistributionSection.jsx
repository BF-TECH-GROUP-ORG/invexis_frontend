import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0] || {};
    const name = p.name ?? "—";
    const value = typeof p.value !== "undefined" ? Number(p.value) : 0;
    const percent =
      typeof p.percent === "number" ? Math.round(p.percent * 100) : 0;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-xs">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.payload?.fill }}
          ></span>
          <span className="text-gray-600 dark:text-gray-300">
            {value.toLocaleString()} ({percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data = [] }) => {
  return (
    <div className="flex flex-col justify-center gap-3 ml-8">
      {(data || []).map((item = {}, index) => {
        const name = item.name ?? "—";
        const value =
          typeof item.value !== "undefined" ? Number(item.value) : 0;
        const color = item.fill ?? "#cbd5e1";
        return (
          <div
            key={item.name ?? index}
            className="flex items-center justify-between text-sm group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-xl border border-transparent hover:border-gray-100 transition-all w-full min-w-[180px]"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-gray-100 dark:ring-gray-700"
                style={{ backgroundColor: color }}
              ></span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {name}
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white ml-6 tabular-nums">
              {value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const InventoryDistributionSection = ({
  statusData = [],
  valueData = [],
  totalUnits,
  totalValue,
}) => {
  const themeColors = ["#081422", "#ea580c", "#fb923c", "#94a3b8", "#cbd5e1"];

  const statusDataBuffered = (statusData || []).map((d, i) => ({
    ...d,
    fill:
      d.name === "In Stock"
        ? "#081422"
        : d.name === "Low Stock"
        ? "#ea580c"
        : d.name === "Out of Stock"
        ? "#ef4444"
        : themeColors[i % themeColors.length],
  }));

  const valueDataBuffered = (valueData || []).map((d, i) => ({
    ...d,
    fill: themeColors[i % themeColors.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
        <div className="flex items-center w-full justify-around">
          <div className="h-64 w-64 shrink-0 relative min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDataBuffered}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={8}
                  stroke="none"
                >
                  {statusDataBuffered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700 bg-white/0">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(typeof totalUnits !== "undefined"
                    ? totalUnits
                    : statusDataBuffered.reduce(
                        (acc, curr) => acc + (Number(curr.value) || 0),
                        0
                      )
                  ).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">
                  Total Items
                </span>
              </div>
            </div>
          </div>
          <CustomLegend data={statusDataBuffered} />
        </div>
      </div>

      {/* Value Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
        <div className="flex items-center w-full justify-around">
          <div className="h-64 w-64 shrink-0 relative min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valueDataBuffered}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={8}
                  stroke="none"
                >
                  {valueDataBuffered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700 bg-white/0">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  $
                  {(
                    (typeof totalValue !== "undefined"
                      ? totalValue
                      : valueDataBuffered.reduce(
                          (acc, curr) => acc + (Number(curr.value) || 0),
                          0
                        )) / 1000
                  ).toFixed(1)}
                  k
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">
                  Total Value
                </span>
              </div>
            </div>
          </div>
          <CustomLegend data={valueDataBuffered} />
        </div>
      </div>
    </div>
  );
};

export default InventoryDistributionSection;
