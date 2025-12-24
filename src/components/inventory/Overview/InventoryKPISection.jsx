import React, { useState } from "react";
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
  Maximize2,
  Minimize2,
} from "lucide-react";

const formatValue = (value, isCompact) => {
  const num = Number(value) || 0;
  if (!isCompact) return num.toLocaleString();

  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
};

const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  data,
  type = "bar",
  color,
  isCurrency = false,
  isCompact = true,
  onToggleCompact,
}) => {
  const isPositive = trend >= 0;

  // Map generic color prop to specific Orange/#081422 theme or keep differentiation if requested
  // Request: "For Cards that start use different colors on the icon and their backgrounds"
  // So we keep differentiation but use the new style: Icon 100%, Bg low opacity same color.

  const themes = {
    blue: {
      icon: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-600/10 dark:bg-blue-400/10",
      chart: "#2563eb",
      border: "hover:border-blue-300 dark:hover:border-blue-800",
    },
    orange: {
      icon: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-600/10 dark:bg-orange-400/10",
      chart: "#ea580c",
      border: "hover:border-orange-300 dark:hover:border-orange-800",
    },
    emerald: {
      icon: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-600/10 dark:bg-emerald-400/10",
      chart: "#10b981",
      border: "hover:border-emerald-300 dark:hover:border-emerald-800",
    },
    rose: {
      icon: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-600/10 dark:bg-rose-400/10",
      chart: "#f43f5e",
      border: "hover:border-rose-300 dark:hover:border-rose-800",
    },
    indigo: {
      icon: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-600/10 dark:bg-indigo-400/10",
      chart: "#6366f1",
      border: "hover:border-indigo-300 dark:hover:border-indigo-800",
    },
  };

  const theme = themes[color] || themes.orange;
  const iconClass = theme.icon;
  const bgClass = theme.bg;
  const chartColor = theme.chart;
  const borderClass = theme.border;

  const displayValue = (() => {
    if (isCurrency) {
      const num = Number(value) || 0;
      if (isCompact) return `$${formatValue(num, true)}`;
      return `$${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    if (typeof value === "number") return value.toLocaleString();
    return value;
  })();

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 ${borderClass} transition-all duration-300 group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">
            {title}
          </p>
          <div className="flex items-center gap-2">
            <h3
              className={`font-bold text-gray-900 dark:text-white transition-all ${
                displayValue.length > 12 ? "text-lg" : "text-2xl"
              }`}
            >
              {displayValue}
            </h3>
            {isCurrency && (
              <button
                onClick={onToggleCompact}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title={isCompact ? "Show full value" : "Show compact value"}
              >
                {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-xl shrink-0 ${bgClass} ${iconClass}`}>
          <Icon className="w-5 h-5" />
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

        <div className="h-12 w-24 min-w-0 min-h-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data}>
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {(data || []).map((entry, index) => (
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

const computeTrendPercent = (arr = []) => {
  if (!Array.isArray(arr) || arr.length < 2) return 0;
  const first = Number(arr[0]?.value ?? 0);
  const last = Number(arr[arr.length - 1]?.value ?? 0);
  if (first === 0) return last === 0 ? 0 : 100;
  return Math.round(((last - first) / Math.abs(first)) * 100);
};

const InventoryKPISection = ({ summary = {}, sparklines = {}, kpis = {} }) => {
  const [isCompact, setIsCompact] = useState(true);

  // prefer computed values when available
  const totalValue =
    summary.summaryComputed?.totalValue ?? summary.totalValue ?? 0;
  const totalUnits =
    summary.summaryComputed?.totalUnits ??
    summary.totalUnits ??
    summary.totalProducts ??
    0;
  const lowStock =
    summary.summaryComputed?.lowStockCount ?? summary.lowStockCount ?? 0;
  const netMovement =
    summary.summaryComputed?.netStockMovement ?? summary.netStockMovement ?? 0;

  if (!summary) return null;

  const getSpark = (key) =>
    sparklines?.[key]?.length > 0
      ? sparklines[key]
      : Array.from({ length: 10 }).map(() => ({ value: 0 }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Inventory Value"
          value={totalValue}
          icon={DollarSign}
          trend={computeTrendPercent(getSpark("value"))}
          data={getSpark("value")}
          type="area"
          color="indigo"
          isCurrency={true}
          isCompact={isCompact}
          onToggleCompact={() => setIsCompact(!isCompact)}
        />
        <KPICard
          title="Total Units"
          value={totalUnits}
          icon={Package}
          trend={computeTrendPercent(getSpark("units"))}
          data={getSpark("units")}
          type="bar"
          color="orange"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStock}
          icon={AlertTriangle}
          trend={computeTrendPercent(getSpark("risk"))}
          data={getSpark("risk")}
          type="area"
          color="rose"
        />
        <KPICard
          title="Net Movement"
          value={netMovement > 0 ? `+${netMovement}` : netMovement}
          icon={Activity}
          trend={computeTrendPercent(getSpark("movement"))}
          data={getSpark("movement")}
          type="bar"
          color="emerald"
        />
      </div>

      {/* Additional KPIs from analytics endpoint (if available) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Gross Profit"
          value={kpis?.grossProfit ?? "—"}
          icon={DollarSign}
          trend={Math.round(kpis?.grossMargin ?? 0)}
          data={getSpark("value")}
          type="area"
          color="indigo"
          isCurrency={true}
          isCompact={true}
        />
        <KPICard
          title="Gross Margin"
          value={kpis?.grossMargin != null ? `${kpis.grossMargin}%` : "—"}
          icon={TrendingUp}
          trend={computeTrendPercent(getSpark("value"))}
          data={getSpark("value")}
          type="bar"
          color="blue"
        />
        <KPICard
          title="Inventory Turnover"
          value={kpis?.inventoryTurnoverRatio ?? "—"}
          icon={Activity}
          trend={0}
          data={getSpark("movement")}
          type="bar"
          color="emerald"
        />
        <KPICard
          title="Holding Days"
          value={kpis?.inventoryHoldingDays ?? "—"}
          icon={Package}
          trend={0}
          data={getSpark("units")}
          type="bar"
          color="rose"
        />
      </div>
    </>
  );
};

export default InventoryKPISection;
