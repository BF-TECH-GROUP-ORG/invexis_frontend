import React, { useState, useMemo, memo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  DollarSign,
  Activity,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/shared/Skeleton";
import { useTranslations } from "next-intl";

const formatValue = (value, isCompact) => {
  const num = Number(value) || 0;
  if (!isCompact) return num.toLocaleString();

  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
};

const CustomTooltip = ({ active, payload, label }) => {
  const t = useTranslations("inventoryOverview.insights");
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl">
        <p className="text-[10px] text-gray-400 mb-1">
          {new Date(label).toLocaleDateString("en-RW", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {new Intl.NumberFormat("en-RW", {
            style: "currency",
            currency: "RWF",
            maximumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const KPISparkline = ({ data, color, locale }) => {
  // Check if all values are zero
  const allZero = !data || data.length === 0 || data.every(d => (d.value || 0) === 0);

  if (allZero) {
    // Render a completely flat line when all values are zero
    return (
      <div className="h-16 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[{ value: 0, name: '' }]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1}
              fillOpacity={0.1}
              fill={`url(#gradient-${color})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Normal chart with data
  return (
    <div className="h-16 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" hide />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${color})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const KPICard = memo(({
  title,
  value,
  icon: Icon,
  trend,
  data,
  color,
  isCurrency = false,
  isCompact = true,
  onToggleCompact,
  index = 0,
  isLoading = false,
  locale = 'en-RW',
}) => {
  const isPositive = trend >= 0;

  const themes = {
    blue: {
      icon: "#2563eb",
      bg: "#eff6ff",
    },
    orange: {
      icon: "#ea580c",
      bg: "#fed7aa",
    },
    emerald: {
      icon: "#10b981",
      bg: "#ecfdf5",
    },
    rose: {
      icon: "#f43f5e",
      bg: "#fee2e2",
    },
    indigo: {
      icon: "#6366f1",
      bg: "#e0e7ff",
    },
  };

  const theme = themes[color] || themes.orange;

  const displayValue = useMemo(() => {
    if (isCompact) {
      if (isCurrency) {
        const num = Number(value) || 0;
        return `${formatValue(num, true)} RWF`;
      }
      if (typeof value === "number") return value.toLocaleString();
      return value;
    }

    if (isCurrency) {
      const num = Number(value) || 0;
      return `${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} RWF`;
    }
    if (typeof value === "number") return value.toLocaleString();
    return value;
  }, [isCompact, value, isCurrency]);

  const showToggle = isCurrency && Number(value) >= 1000;

  if (isLoading) {
    return (
      <div className="border-2 border-gray-100 rounded-xl md:rounded-2xl p-3 md:p-5 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="grow">
            <Skeleton className="h-3 md:h-4 w-24 mb-2" />
            <Skeleton className="h-6 md:h-8 w-32 mb-4" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 md:h-12 w-10 md:w-12 rounded-lg md:rounded-xl shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, layout: { duration: 0.3, type: "spring" } }}
      className="border-2 border-[#e5e7eb] dark:border-gray-700 rounded-xl md:rounded-2xl p-3 md:p-5 bg-white dark:bg-gray-800 hover:border-[#ff782d] transition-colors hover:shadow-lg group w-full"
    >
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="grow">
          <motion.p layout="position" className="text-xs md:text-sm text-[#6b7280] font-semibold mb-1 uppercase tracking-wider">
            {title}
          </motion.p>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isCompact ? "compact" : "expanded"}
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-lg md:text-2xl font-extrabold font-jetbrains text-[#111827] dark:text-white"
              >
                {displayValue}
              </motion.div>
            </AnimatePresence>

            {showToggle && (
              <motion.button
                layout
                onClick={onToggleCompact}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md"
              >
                {isCompact ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </motion.button>
            )}

            {trend !== undefined && (
              <motion.div layout="position" className={`flex items-center text-xs font-bold ml-2 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(trend).toFixed(1)}%
              </motion.div>
            )}
          </div>
        </div>

        <motion.div
          layout
          className="p-2 md:p-3 rounded-lg md:rounded-xl shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: theme.bg }}
        >
          {Icon && <Icon size={20} className="md:w-6 md:h-6" style={{ color: theme.icon }} />}
        </motion.div>
      </div>

      {data && data.length > 0 && (
        <KPISparkline data={data} color={theme.icon} locale={locale} />
      )}
    </motion.div>
  );
});

const computeTrendPercent = (arr = []) => {
  if (!Array.isArray(arr) || arr.length < 2) return 0;
  const first = Number(arr[0]?.value ?? 0);
  const last = Number(arr[arr.length - 1]?.value ?? 0);
  if (first === 0) return last === 0 ? 0 : 100;
  return Math.round(((last - first) / Math.abs(first)) * 100);
};

// Generate sample sparkline data for demonstration
const generateSampleSparkline = (key, baseValue = 100) => {
  const days = 10;
  // Use a fixed base date for SSR consistency (start of the current day in RWF time)
  const baseDate = new Date("2024-01-01T00:00:00Z");

  return Array.from({ length: days }, (_, i) => {
    // Deterministic variation based on index and key string length/hash
    const seed = (key?.length || 0) + i;
    const variation = Math.sin(seed / 2) * 0.3; // Removed Math.random()

    return {
      value: Math.max(0, Math.round(baseValue * (1 + variation))),
      name: new Date(baseDate.getTime() + i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });
};

const InventoryKPISection = ({ summary = {}, sparklines = {}, kpis = {} }) => {
  const t = useTranslations("inventoryOverview.kpi");
  const [isCompact, setIsCompact] = useState(true);
  const [isGrossProfitCompact, setIsGrossProfitCompact] = useState(true);

  // Use kpis directly (from API) or fallback to computed values
  const totalValue = kpis?.totalInventoryValue ?? summary?.totalValue ?? 0;
  const totalUnits = kpis?.totalInventoryUnits ?? summary?.totalUnits ?? 0;
  const lowStock = kpis?.lowStockItemsCount ?? summary?.lowStockCount ?? 0;
  const netMovement = kpis?.netStockMovement ?? summary?.netStockMovement ?? 0;

  // Enhanced getSpark: use real data if available, otherwise generate sample
  const getSpark = (key) => {
    if (sparklines?.[key]?.length > 0) {
      return sparklines[key];
    }

    // Generate sample data based on key
    switch (key) {
      case 'value':
        return generateSampleSparkline(key, totalValue / 10);
      case 'units':
        return generateSampleSparkline(key, totalUnits / 10);
      case 'risk':
        return generateSampleSparkline(key, lowStock > 0 ? lowStock * 2 : 50);
      case 'movement':
        return generateSampleSparkline(key, Math.abs(netMovement) || 50);
      default:
        return generateSampleSparkline(key, 100);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <KPICard
          title={t("totalValue")}
          value={totalValue}
          icon={DollarSign}
          trend={computeTrendPercent(getSpark("value"))}
          data={getSpark("value")}
          color="indigo"
          isCurrency={true}
          isCompact={isCompact}
          onToggleCompact={() => setIsCompact(!isCompact)}
          index={0}
        />
        <KPICard
          title={t("totalUnits")}
          value={totalUnits}
          icon={Package}
          trend={computeTrendPercent(getSpark("units"))}
          data={getSpark("units")}
          color="orange"
          index={1}
        />
        <KPICard
          title={t("lowStock")}
          value={lowStock}
          icon={AlertTriangle}
          trend={computeTrendPercent(getSpark("risk"))}
          data={getSpark("risk")}
          color="rose"
          index={2}
        />
        <KPICard
          title={t("netMovement")}
          value={netMovement > 0 ? `+${netMovement}` : netMovement}
          icon={Activity}
          trend={computeTrendPercent(getSpark("movement"))}
          data={getSpark("movement")}
          color="emerald"
          index={3}
        />
      </div>

      {/* Additional KPIs from analytics endpoint (if available) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <KPICard
          title={t("grossProfit")}
          value={kpis?.grossProfit ?? "—"}
          icon={DollarSign}
          trend={Math.round(kpis?.grossMargin ?? 0)}
          data={getSpark("value")}
          color="indigo"
          isCurrency={true}
          isCompact={isGrossProfitCompact}
          onToggleCompact={() => setIsGrossProfitCompact(!isGrossProfitCompact)}
          index={4}
        />
        <KPICard
          title={t("stockTurnover")}
          value={kpis?.stockTurnoverRate ?? "—"}
          icon={Activity}
          trend={0}
          data={getSpark("movement")}
          color="emerald"
          index={5}
        />
      </div>
    </>
  );
};

export default InventoryKPISection;

