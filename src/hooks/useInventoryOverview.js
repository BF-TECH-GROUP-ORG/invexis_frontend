import { useState, useEffect, useCallback } from "react";
import OverviewService from "@/services/overviewService";
import productsService from "@/services/productsService";

const useInventoryOverview = (companyId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    summary: null,
    statusDistribution: [],
    valueDistribution: [],
    movementTrend: [],
    financialTrend: [],
    topProducts: [],
    riskProducts: [],
    shopPerformance: [],
    activities: [],
    recentProducts: [],
    health: [],
    valueTrends: [],
    heatmapData: [],
    kpiSparklines: {},
  });

  const aggregateHeatmap = (activities) => {
    const heatmap = Array.from({ length: 28 }).fill(0);
    if (!activities || !Array.isArray(activities)) return heatmap;

    activities.forEach((activity) => {
      const date = new Date(
        activity.createdAt || activity.timestamp || Date.now()
      );
      const hour = date.getHours();
      const day = date.getDay(); // 0-6
      const timeBlock = Math.floor(hour / 6); // 0-3
      const index = day * 4 + timeBlock;
      if (index < 28) heatmap[index] += 1;
    });

    const max = Math.max(...heatmap, 1);
    return heatmap.map((v) => Math.round((v / max) * 100));
  };

  const generateSparkFromTrend = (
    trendData = [],
    key = "value",
    length = 10
  ) => {
    if (!Array.isArray(trendData) || trendData.length === 0) {
      return Array.from({ length }).map(() => ({ value: 0 }));
    }

    // Map provided trend array to simple { value } shape suitable for small charts
    const values = trendData
      .map((d) => {
        if (typeof d === "number") return { value: d };
        if (d && typeof d === "object") {
          if (key in d) return { value: Number(d[key]) || 0 };
          if (d.metrics && key in d.metrics)
            return { value: Number(d.metrics[key]) || 0 };
        }
        return { value: 0 };
      })
      .slice(-length);

    // If shorter than length, pad with 0s
    if (values.length < length) {
      const pad = Array.from({ length: length - values.length }).map(() => ({
        value: 0,
      }));
      return [...pad, ...values];
    }

    return values;
  };

  const fetchAllData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const [
        dashboardData,
        companyOverview,
        inventorySummary,
        shops,
        riskProducts,
        topProducts,
        activitiesResponse,
        recentProductsResponse,
        productsResponse,
        trendsResponse,
      ] = await Promise.all([
        OverviewService.getDashboardData(companyId),
        OverviewService.getCompanyOverview(companyId),
        OverviewService.getInventorySummary(companyId),
        OverviewService.getShops({ companyId }),
        OverviewService.getStockoutRisk({ companyId }),
        OverviewService.getTopProducts({ companyId }),
        OverviewService.getStockChanges({ companyId, limit: 50 }),
        OverviewService.getProducts({ companyId, limit: 50 }),
        // fallback: use productsService if OverviewService doesn't return full details
        productsService.getProducts({ companyId, limit: 1000 }),
        OverviewService.getInventoryTrends({ companyId, period: "month" }),
      ]);

      // Prefer the most detailed products list available
      const products =
        (productsResponse && Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse) ||
        (productsResponse && Array.isArray(productsResponse)) ||
        (productsResponse && productsResponse.items) ||
        (productsResponse && productsResponse.data?.items) ||
        (Array.isArray(recentProductsResponse) ? recentProductsResponse : []) ||
        [];

      // If OverviewService.getProducts returned empty, try the direct productsService
      const fallbackProducts =
        productsResponse && Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse || [];

      const effectiveProducts = products.length ? products : fallbackProducts;

      // Normalize common API response shapes into arrays
      const extractArray = (src) => {
        if (!src) return [];
        if (Array.isArray(src)) return src;
        if (src.items && Array.isArray(src.items)) return src.items;
        if (src.data && Array.isArray(src.data)) return src.data;
        if (src.data && src.data.data && Array.isArray(src.data.data))
          return src.data.data;
        if (src.results && Array.isArray(src.results)) return src.results;
        if (src.metrics && Array.isArray(src.metrics)) return src.metrics;
        return [];
      };

      const activities = extractArray(activitiesResponse);
      const recentProducts = extractArray(recentProductsResponse);
      // normalize shops response to an array (api returns { success, data: [...] })
      const shopsList = extractArray(shops);

      const trendsArray =
        extractArray(dashboardData.trends) ||
        extractArray(trendsResponse) ||
        extractArray(dashboardData.metrics?.graphs?.inventoryTrends) ||
        [];

      const formatActivityTime = (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Recently";
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString();
      };

      // Compute inventory totals (units & value) from products
      let totalValue = 0;
      let totalUnits = 0;
      let totalProducts = 0;
      const categoryMap = {};

      effectiveProducts.forEach((p) => {
        totalProducts += 1;
        const details = (p.stock && p.stock.details) || [];
        const price =
          Number(p.pricing?.salePrice) || Number(p.pricing?.basePrice) || 0;

        if (details.length > 0) {
          details.forEach((d) => {
            const qty =
              Number(d.availableQty ?? d.stockQty ?? d.available ?? 0) || 0;
            totalUnits += qty;
            totalValue += qty * price;
            const catName =
              p.category?.name || p.category?.slug || "Uncategorized";
            categoryMap[catName] = (categoryMap[catName] || 0) + qty * price;
          });
        } else {
          const qty = Number(p.stock?.total ?? p.stockQty ?? 0) || 0;
          totalUnits += qty;
          totalValue += qty * price;
          const catName =
            p.category?.name || p.category?.slug || "Uncategorized";
          categoryMap[catName] = (categoryMap[catName] || 0) + qty * price;
        }
      });

      const computedCategoryDistribution = Object.keys(categoryMap).map(
        (k, i) => ({
          name: k,
          value: Math.round(categoryMap[k]),
          fill: undefined,
        })
      );

      // compute health counts
      let inStockCnt = 0;
      let lowStockCnt = 0;
      let outOfStockCnt = 0;
      effectiveProducts.forEach((p) => {
        const details = (p.stock && p.stock.details) || [];
        const total =
          details.reduce(
            (acc, d) =>
              acc +
              (Number(d.availableQty ?? d.stockQty ?? d.available ?? 0) || 0),
            0
          ) || Number(p.stock?.total ?? 0);
        if (total <= 0) outOfStockCnt += 1;
        else inStockCnt += 1;
        // check low stock by thresholds if details present
        const isLow = details.some(
          (d) =>
            d.isLowStock ||
            (d.availableQty ?? d.stockQty) <= (d.lowStockThreshold ?? 0)
        );
        if (isLow) lowStockCnt += 1;
      });

      const healthSeries = [
        {
          month: "Now",
          inStock: inStockCnt,
          lowStock: lowStockCnt,
          outOfStock: outOfStockCnt,
        },
      ];

      const trendPoints = trendsArray || [];

      const sparkValue = generateSparkFromTrend(trendPoints, "totalValue", 10);
      const sparkUnits = generateSparkFromTrend(trendPoints, "totalUnits", 10);
      const sparkMovement = generateSparkFromTrend(
        trendPoints,
        "netMovement",
        10
      );
      const sparkRisk = generateSparkFromTrend(
        riskProducts || [],
        "stockoutRiskDays",
        10
      );

      // normalize movement trend for charting library
      const processedMovementTrend = (trendPoints || []).map((d, i) => {
        const metrics = d.metrics || {};
        const stockIn =
          Number(metrics.inbound ?? d.inbound ?? d.stockIn ?? 0) || 0;
        const stockOut =
          Number(metrics.outbound ?? d.outbound ?? d.stockOut ?? 0) || 0;
        const netChange =
          Number(
            metrics.netMovement ??
              d.netMovement ??
              d.netChange ??
              stockIn - stockOut
          ) || 0;
        const monthLabel =
          d.month ||
          (d.date && new Date(d.date).toLocaleDateString()) ||
          `P${i + 1}`;
        return {
          month: monthLabel,
          stockIn,
          stockOut,
          netChange,
        };
      });

      // Compose financial chart friendly data
      let financialChartData = [];
      const profitComparison =
        dashboardData.metrics?.graphs?.profitComparison ||
        trendsResponse?.profitComparison ||
        null;
      if (profitComparison && profitComparison.periods) {
        financialChartData = Object.keys(profitComparison.periods).map((k) => {
          const p = profitComparison.periods[k];
          return {
            month: p.label || k,
            revenue: Number(p.metrics?.revenue ?? 0),
            cost: Number(p.metrics?.cost ?? 0),
          };
        });
      } else if (dashboardData.financial) {
        financialChartData = (dashboardData.financial || []).map((d, i) => ({
          month: d.month || `P${i + 1}`,
          revenue: Number(d.revenue ?? 0),
          cost: Number(d.cost ?? 0),
        }));
      } else {
        financialChartData = generateSparkFromTrend(
          trendPoints,
          "profit",
          10
        ).map((v, i) => ({
          month: `P${i + 1}`,
          revenue: v.value || 0,
          cost: 0,
        }));
      }

      // prepare value trends with readable month labels
      const valueTrendsProcessed = (trendPoints || [])
        .slice(-12)
        .map((d, i) => {
          const v =
            Number(
              d.totalValue ??
                d.metrics?.totalValue ??
                d.value ??
                d.netChange ??
                0
            ) || 0;
          const month =
            d.month ||
            (d.date &&
              new Date(d.date).toLocaleString(undefined, { month: "short" })) ||
            `P${i + 1}`;
          return { month, value: v };
        });

      setData({
        summary: dashboardData.summary || dashboardData.metrics?.summary || {},
        // overwrite / complement summary fields with computed values
        summaryComputed: {
          totalValue,
          totalUnits,
          totalProducts,
          lowStockCount:
            inventorySummary?.data?.overview?.lowStockCount ||
            (dashboardData.lowStock?.length ?? 0) ||
            (dashboardData.summary?.lowStockCount ?? 0),
          netStockMovement: dashboardData.summary?.netStockMovement || 0,
        },
        statusDistribution:
          inventorySummary?.data?.summary?.byCategory ||
          dashboardData.summary?.distribution ||
          [],
        valueDistribution:
          computedCategoryDistribution.length > 0
            ? computedCategoryDistribution
            : inventorySummary?.data?.summary?.byCategory ||
              dashboardData.summary?.categoryDistribution ||
              [],
        movementTrend: processedMovementTrend,
        financialTrend: dashboardData.metrics?.graphs?.profitComparison || [],
        financialChartData,
        topProducts:
          topProducts && (topProducts.data || topProducts.items)
            ? (topProducts.data || topProducts.items).map((p) => ({
                id: p._id || p.id || Math.random(),
                name: p.name || p.productName || p.label || "Product",
                profit: Number(p.profit ?? p.metrics?.profit ?? 0),
                unitsSold: Number(
                  p.units ?? p.metrics?.units ?? p.totalSold ?? 0
                ),
              }))
            : Array.isArray(topProducts)
            ? topProducts
            : [],
        riskProducts:
          riskProducts && (riskProducts.data || riskProducts.items)
            ? (riskProducts.data || riskProducts.items).map((r) => ({
                id: r._id || r.productId || Math.random(),
                name: r.productName || r.name || r.product?.name || "",
                stock: Number(r.totalStock ?? r.stock ?? 0),
                burnRate: Number(r.avgDailySales ?? r.burnRate ?? 0),
                remainingDays:
                  r.daysUntilStockout ??
                  r.stockoutRiskDays ??
                  r.remainingDays ??
                  null,
              }))
            : Array.isArray(riskProducts)
            ? riskProducts
            : [],
        shopPerformance:
          shopsList.map((shop) => ({
            name: shop.name || shop.label || "Store",
            revenue: shop.revenue || shop.performance?.revenue || 0,
            units: shop.stockCount || shop.performance?.units || 0,
          })) || [],
        activities: activities
          .map((a) => ({
            id: a.id || a._id || Math.random(),
            type: a.type || (a.changeType === "INCREASE" ? "RESTOCK" : "SALE"),
            item: a.productName || a.product?.name || "Product",
            quantity: a.quantity || a.changeAmount || 0,
            time: formatActivityTime(a.createdAt || a.timestamp),
          }))
          .slice(0, 10),
        recentProducts: recentProducts.map((p) => ({
          id: p.id || p._id || Math.random(),
          name: p.name,
          addedBy: p.createdBy?.name || p.creatorName || "Staff",
        })),
        health:
          (dashboardData.summary?.statusHistory || []).length > 0
            ? dashboardData.summary.statusHistory
            : healthSeries,
        valueTrends:
          valueTrendsProcessed.length > 0
            ? valueTrendsProcessed
            : sparkValue.map((s, i) => ({
                month: `P${i + 1}`,
                value: s.value,
              })),
        heatmapData: aggregateHeatmap(activities),
        kpiSparklines: {
          value: sparkValue,
          units: sparkUnits,
          movement: sparkMovement,
          risk: sparkRisk,
        },
      });
    } catch (err) {
      console.error("Failed to fetch inventory overview data:", err);
      setError(err.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    loading,
    error,
    data,
    refetch: fetchAllData,
  };
};

export default useInventoryOverview;
