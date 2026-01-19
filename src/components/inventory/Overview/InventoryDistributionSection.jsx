import React, { useEffect, useState, useRef, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getProducts } from "@/services/productsService";
import { getAllShops } from "@/services/shopService";
import { useSession } from "next-auth/react";

const CustomTooltip = ({ active, payload, coordinate, total }) => {
  if (active && payload && payload.length) {
    const p = payload[0] || {};
    const name = p.name ?? "—";
    const value = typeof p.value !== "undefined" ? Number(p.value) : 0;

    // percent may be provided by recharts as a fraction (e.g., 0.012),
    // but small slices could round to 0 if we use Math.round(p.percent * 100).
    // Prefer showing one decimal place for small values (e.g., 0.4%).
    let percentStr = "0";
    if (typeof p.percent === "number") {
      const pct = p.percent * 100;
      percentStr = pct < 1 ? pct.toFixed(1) : Math.round(pct).toString();
    } else if (typeof total === "number" && total > 0) {
      const pct = (value / total) * 100;
      percentStr = pct < 1 ? pct.toFixed(1) : Math.round(pct).toString();
    }

    // ensure tooltip is above center text by raising zIndex
    return (
      <div
        className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-xs"
        style={{ zIndex: 1100 }}
      >
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.payload?.fill }}
          ></span>
          <span className="text-gray-600 dark:text-gray-300">
            {value.toLocaleString()} ({percentStr}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data = [], total }) => {
  // compute sum if total not supplied
  const totalValue =
    typeof total === "number"
      ? total
      : (data || []).reduce((acc, it = {}) => acc + (Number(it.value) || 0), 0);

  const containerRef = useRef(null);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  const handleMouseEnter = (e, item = {}) => {
    const value = typeof item.value !== "undefined" ? Number(item.value) : 0;
    const percent =
      totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0.0";
    const content = `${value.toLocaleString()} / ${totalValue.toLocaleString()} (${percent}%)`;

    const containerRect = containerRef.current?.getBoundingClientRect();
    const itemRect = e.currentTarget.getBoundingClientRect();

    if (containerRect) {
      // Position tooltip centrally above the item
      const x = itemRect.left - containerRect.left + itemRect.width / 2;
      const y = itemRect.top - containerRect.top - 8;
      setTip({ visible: true, x, y, content });
    } else {
      setTip({ visible: true, x: 0, y: 0, content });
    }
  };

  const handleMouseLeave = () => {
    setTip({ visible: false, x: 0, y: 0, content: "" });
  };

  return (
    <div
      ref={containerRef}
      className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 ml-0 xl:ml-4 max-h-72 overflow-y-auto pr-2 w-full"
    >
      {(data || []).map((item = {}, index) => {
        const name = item.name ?? "—";
        const value =
          typeof item.value !== "undefined" ? Number(item.value) : 0;
        const color = item.fill ?? "#cbd5e1";
        const percent =
          totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
        return (
          <div
            key={`${String(name)}-${index}`}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
            className="flex items-center justify-between text-sm group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-xl border border-transparent hover:border-gray-100 transition-all w-full"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-gray-100 dark:ring-gray-700 shrink-0"
                style={{ backgroundColor: color }}
              ></span>
              <span className="text-gray-600 dark:text-gray-300 font-medium truncate">
                {name}
              </span>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="font-bold text-gray-900 dark:text-white tabular-nums">
                {value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {percent}%
              </div>
            </div>
          </div>
        );
      })}

      {tip.visible && (
        <div
          className="absolute z-100 pointer-events-none bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl text-xs whitespace-nowrap"
          style={{
            left: tip.x,
            top: tip.y,
            transform: "translate(-50%, -100%)",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
          }}
        >
          <div className="font-bold text-gray-900 dark:text-white">
            {tip.content}
          </div>
          {/* Small arrow down */}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const InventoryDistributionSection = ({
  statusData = [],
  valueByCategory = [],
  valueByShop = [],
  valueByStatus = [],
  valueData = [], // back-compat
  totalUnits,
  totalValue,
  companyId,
}) => {
  const { data: session } = useSession();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract companyId from session if not provided
  const finalCompanyId = useMemo(() => {
    if (companyId) return companyId;
    const companyObj = session?.user?.companies?.[0];
    return typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id;
  }, [companyId, session]);

  // Fetch shops data
  useEffect(() => {
    const fetchShops = async () => {
      if (!finalCompanyId) return;
      try {
        const shopsList = await getAllShops(finalCompanyId);
        setShops(shopsList || []);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [finalCompanyId]);

  // Create a map of shop ID to shop name for quick lookup
  const shopNameMap = useMemo(() => {
    const map = {};
    shops.forEach((shop) => {
      if (shop._id || shop.id) {
        map[shop._id || shop.id] = shop.name || shop.shopName || "Shop";
      }
    });
    return map;
  }, [shops]);

  const themeColors = useMemo(
    () => ["#081422", "#ea580c", "#fb923c", "#94a3b8", "#cbd5e1"],
    []
  );

  const [valueView, setValueView] = React.useState("category");

  // Helper: format currency similar to KPI card (compact by default)
  const formatCurrency = (value, isCompact = true) => {
    const num = Number(value) || 0;
    if (!isCompact) {
      return `${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} RWF`;
    }
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B RWF`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M RWF`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K RWF`;
    return `${num.toString()} RWF`;
  };

  const totalProducts = useMemo(() => {
    return statusData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  }, [statusData]);

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

  // Select current value dataset based on view preference
  const selectedValueData =
    valueView === "category"
      ? valueByCategory
      : valueView === "shop"
        ? valueByShop
        : valueView === "status"
          ? valueByStatus
          : valueData || [];

  const valueDataBuffered = useMemo(() => {
    return (selectedValueData || []).map((d, i) => {
      // Get shop name if this is a shop entry
      let displayName = d.name;
      if (valueView === "shop") {
        // The shopId is explicitly stored
        const shopId = d.shopId;
        
        // Try to get mapped shop name first
        if (shopId && shopNameMap[shopId]) {
          displayName = shopNameMap[shopId];
        } else {
          // If no mapped name, keep the shopId (which is stored in name field from hook)
          displayName = shopId || d.name;
        }
      }

      return {
        ...d,
        fill: d.fill || themeColors[i % themeColors.length],
        name:
          displayName ||
          d.categoryName ||
          d.status ||
          d.categoryId ||
          `Slice ${i + 1}`,
        value: Number(d.value || d.amount || 0),
      };
    });
  }, [selectedValueData, valueView, shopNameMap, themeColors]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center gap-4 md:gap-6">
        <div className="w-full min-w-0 h-[250px] md:h-[300px] relative">
          <div className="absolute top-0 left-0 z-10">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Inventory Status
            </h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Breakdown by stock level</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDataBuffered}
                cx="50%"
                cy="55%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={5}
                stroke="none"
              >
                {statusDataBuffered.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip total={totalProducts} />}
                wrapperStyle={{ zIndex: 1200 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-8">
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                {totalProducts.toLocaleString()}
              </span>
              <span className="text-[8px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                Products
              </span>
            </div>
          </div>
        </div>
        <div className="w-full md:flex-1 md:w-auto flex items-center justify-center">
          <CustomLegend data={statusDataBuffered} total={totalProducts} />
        </div>
      </div>

      {/* Value Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center gap-4 md:gap-6">
        <div className="w-full min-w-0 h-[250px] md:h-[300px] relative">
          <div className="absolute top-0 left-0 z-10">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Value Distribution
            </h3>
            <div className="flex flex-wrap gap-1 md:gap-2 mt-1.5">
              <button
                onClick={() => setValueView("category")}
                className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${valueView === "category"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                Category
              </button>
              <button
                onClick={() => setValueView("shop")}
                className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${valueView === "shop"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                Shop
              </button>
              <button
                onClick={() => setValueView("status")}
                className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${valueView === "status"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                Status
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={valueDataBuffered}
                cx="50%"
                cy="55%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={5}
                stroke="none"
              >
                {valueDataBuffered.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip total={totalValue} />}
                wrapperStyle={{ zIndex: 1200 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-8">
            <div className="flex flex-col items-center justify-center">
              <span className="text-base md:text-xl font-bold text-gray-900 dark:text-white leading-none">
                {formatCurrency(totalValue, true)}
              </span>
              <span className="text-[8px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                Total Value
              </span>
            </div>
          </div>
        </div>
        <div className="w-full md:flex-1 md:w-auto flex items-center justify-center">
          <CustomLegend data={valueDataBuffered} total={totalValue} />
        </div>
      </div>
    </div>
  );
};

export default InventoryDistributionSection;
