import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getProducts } from "@/services/productsService";

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
      // position tooltip to the right and slightly above the hovered item
      const x = itemRect.right - containerRect.left + 8; // right edge + offset
      // clamp y so tooltip doesn't overflow container top
      const y = Math.max(0, itemRect.top - containerRect.top - 40);
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
      className="relative flex flex-col justify-center gap-3 ml-4 max-h-72 overflow-y-auto pr-2"
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
            key={item.name ?? index}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
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
            <div className="text-right">
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
          className="absolute z-50 pointer-events-none bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md text-xs"
          style={{ left: tip.x, top: tip.y, minWidth: 140 }}
        >
          <div className="font-semibold text-gray-900 dark:text-white">
            {tip.content}
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryDistributionSection = ({
  statusData = [],
  valueData = [],
  totalUnits,
  totalValue,
  companyId,
}) => {
  const themeColors = ["#081422", "#ea580c", "#fb923c", "#94a3b8", "#cbd5e1"];

  // Helper: format currency similar to KPI card (compact by default)
  const formatCurrency = (value, isCompact = true) => {
    const num = Number(value) || 0;
    if (!isCompact) {
      return `$${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toString()}`;
  };

  // Products-based distribution (fetch when companyId provided)
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSlices, setProductSlices] = useState([]);
  const [productList, setProductList] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalAvailableUnits, setTotalAvailableUnits] = useState(0);

  useEffect(() => {
    let mounted = true;
    const TOP_N = 8; // show top N products and group the rest as 'Other'

    async function fetchProducts() {
      if (!companyId) return;
      setProductsLoading(true);
      try {
        const res = await getProducts({ companyId, limit: 1000 });
        // normalize response shapes
        const list =
          (res && Array.isArray(res.data) && res.data) ||
          (res && Array.isArray(res)) ||
          (res && res.data && res.data.data) ||
          [];

        if (!mounted) return;

        setProducts(list);

        const processed = list.map((p) => {
          const details = (p.stock && p.stock.details) || [];
          const qty =
            details.length > 0
              ? details.reduce(
                  (acc, d) =>
                    acc +
                    (Number(d.availableQty ?? d.stockQty ?? d.available ?? 0) ||
                      0),
                  0
                )
              : Number(p.stock?.available ?? p.stock?.total ?? 0) || 0;
          return {
            id: p._id || p.id,
            name: p.name || p.productName || "Unnamed",
            qty,
          };
        });

        const totalUnitsCalc = processed.reduce(
          (acc, p) => acc + (p.qty || 0),
          0
        );
        const totalProductsCalc = processed.length;

        // sort desc by qty
        const sorted = processed.sort((a, b) => (b.qty || 0) - (a.qty || 0));
        const top = sorted.slice(0, TOP_N);
        const others = sorted.slice(TOP_N);
        const otherSum = others.reduce((acc, p) => acc + (p.qty || 0), 0);

        const slices = top.map((p, i) => ({
          name: p.name,
          value: p.qty,
          fill: themeColors[i % themeColors.length],
        }));
        if (otherSum > 0) {
          slices.push({
            name: "Other",
            value: otherSum,
            fill: themeColors[top.length % themeColors.length],
          });
        }

        setProductSlices(slices);
        // create a full products list for legend (all items)
        setProductList(
          processed.map((p, i) => ({
            name: p.name,
            value: p.qty,
            fill: themeColors[i % themeColors.length],
          }))
        );
        setTotalProducts(totalProductsCalc);
        setTotalAvailableUnits(totalUnitsCalc);
      } catch (err) {
        console.error("Failed to load products for distribution chart", err);
      } finally {
        if (mounted) setProductsLoading(false);
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [companyId]);

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
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-2 dark:border-gray-700 shadow-sm flex items-center justify-center">
        <div className="flex items-center w-full justify-around">
          <div className="h-64 w-64 shrink-0 relative min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    productSlices.length ? productSlices : statusDataBuffered
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={8}
                  stroke="none"
                >
                  {(productSlices.length
                    ? productSlices
                    : statusDataBuffered
                  ).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      total={
                        productSlices.length
                          ? totalAvailableUnits
                          : typeof totalUnits !== "undefined"
                          ? totalUnits
                          : statusDataBuffered.reduce(
                              (acc, curr) => acc + (Number(curr.value) || 0),
                              0
                            )
                      }
                    />
                  }
                  wrapperStyle={{ zIndex: 1200, transform: "translateY(-8px)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center bg-white/0">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {productSlices.length
                    ? totalProducts.toLocaleString()
                    : (typeof totalUnits !== "undefined"
                        ? totalUnits
                        : statusDataBuffered.reduce(
                            (acc, curr) => acc + (Number(curr.value) || 0),
                            0
                          )
                      ).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">
                  {productSlices.length ? "Products" : "Total Items"}
                </span>
              </div>
            </div>
          </div>
          {productSlices.length ? (
            <div className="flex flex-col items-start ml-4">
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">
                Products ({totalProducts.toLocaleString()})
              </div>
              <CustomLegend data={productList} total={totalAvailableUnits} />
            </div>
          ) : (
            <CustomLegend data={statusDataBuffered} />
          )}
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
                <Tooltip
                  content={
                    <CustomTooltip
                      total={
                        typeof totalValue !== "undefined"
                          ? totalValue
                          : valueDataBuffered.reduce(
                              (acc, curr) => acc + (Number(curr.value) || 0),
                              0
                            )
                      }
                    />
                  }
                  wrapperStyle={{ zIndex: 1200, transform: "translateY(-8px)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center bg-white/0">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(
                    typeof totalValue !== "undefined"
                      ? totalValue
                      : valueDataBuffered.reduce(
                          (acc, curr) => acc + (Number(curr.value) || 0),
                          0
                        ),
                    true
                  )}
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">
                  Total Value
                </span>
              </div>
            </div>
          </div>
          <CustomLegend
            data={valueDataBuffered}
            total={valueDataBuffered.reduce(
              (acc, c) => acc + (Number(c.value) || 0),
              0
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryDistributionSection;
