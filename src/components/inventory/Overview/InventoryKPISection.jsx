import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Activity,
  AlertTriangle,
} from "lucide-react";

const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  data,
  type = "bar",
  color,
}) => {
  const isPositive = trend >= 0;

  // Map generic color prop to specific Orange/#081422 theme or keep differentiation if requested
  // Request: "For Cards that start use different colors on the icon and their backgrounds"
  // So we keep differentiation but use the new style: Icon 100%, Bg low opacity same color.

  let iconClass = "";
  let bgClass = "";
  let chartColor = "";

  switch (color) {
    case "emerald":
      iconClass = "text-emerald-600";
      bgClass = "bg-emerald-600/10";
      chartColor = "#10b981";
      break;
    case "blue": // Mapping Blue to the requested Dark color #081422 for variety or keeping blue?
      // User said "Use my primary color ... Orange ... and #081422".
      // Let's swap Blue for #081422 (Slate/Gray dark)
      iconClass = "text-[#081422]";
      bgClass = "bg-[#081422]/10";
      chartColor = "#081422";
      break;
    case "amber": // Mapping Amber to Orange as requested primary
      iconClass = "text-orange-600";
      bgClass = "bg-orange-600/10";
      chartColor = "#ea580c"; // orange-600
      break;
    case "indigo": // Let's keep one accent or map to Orange variation
      iconClass = "text-orange-500";
      bgClass = "bg-orange-500/10";
      chartColor = "#f97316";
      break;
    default:
      iconClass = "text-orange-600";
      bgClass = "bg-orange-600/10";
      chartColor = "#ea580c";
  }

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:border-orange-300 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-2 rounded-xl ${bgClass} ${iconClass}`}>
          <Icon className="w-5 h-5 opacity-100" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={
              isPositive
                ? "text-emerald-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-400 text-xs">vs last month</span>
        </div>

        <div className="h-12 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data}>
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColor}
                      fillOpacity={0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient
                    id={`gradient-${title}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColor}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const InventoryKPISection = ({ summary }) => {
  if (!summary) return null;

  const generateSparkData = () =>
    Array.from({ length: 10 }).map((_, i) => ({
      value: Math.floor(Math.random() * 100) + 20,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Total Inventory Value"
        value={`$${summary.totalValue.toLocaleString()}`}
        icon={DollarSign}
        trend={5.2}
        data={generateSparkData()}
        type="area"
        color="blue" // Maps to #081422
      />
      <KPICard
        title="Total Units"
        value={summary.totalUnits.toLocaleString()}
        icon={Package}
        trend={2.4}
        data={generateSparkData()}
        type="bar"
        color="amber" // Maps to Orange
      />
      <KPICard
        title="Low Stock Items"
        value={summary.lowStockCount}
        icon={AlertTriangle}
        trend={-12.5}
        data={generateSparkData()}
        type="area"
        color="amber" // Maps to Orange
      />
      <KPICard
        title="Net Movement"
        value={`+${summary.netStockMovement}`}
        icon={Activity}
        trend={8.1}
        data={generateSparkData()}
        type="bar"
        color="blue" // Maps to #081422
      />
    </div>
  );
};

export default InventoryKPISection;
