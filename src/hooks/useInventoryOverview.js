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
      // Primary source: unified overview analytics endpoint
      const overviewAnalytics = await OverviewService.getOverviewAnalytics({
        companyId,
      });

      // Extract the data payload from the unified response
      const overviewData = overviewAnalytics?.data || overviewAnalytics || {};

      // Helper to safely extract arrays from various response shapes
      const extractArray = (src) => {
        if (!src) return [];
        if (Array.isArray(src)) return src;
        if (src.items && Array.isArray(src.items)) return src.items;
        if (src.data && Array.isArray(src.data)) return src.data;
        if (src.results && Array.isArray(src.results)) return src.results;
        return [];
      };

      // Helper to format relative time
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

      // ===== EXTRACT & MAP API RESPONSE FIELDS =====

      // Meta (summary info)
      const meta = overviewData?.meta || {};
      const summary = {
        companyId: meta.companyId,
        currency: meta.currency || "USD",
        lastUpdated: meta.generatedAt || new Date().toISOString(),
        dateRange: meta.dateRange || {},
      };

      // KPIs with counts
      const kpisFromApi = overviewData?.kpis || {};
      const kpis = {
        totalInventoryUnits: Number(kpisFromApi.totalInventoryUnits ?? 0),
        totalInventoryValue: Number(kpisFromApi.totalInventoryValue ?? 0),
        netStockMovement: Number(kpisFromApi.netStockMovement ?? 0),
        grossProfit: Number(kpisFromApi.grossProfit ?? 0),
        lowStockItemsCount: Number(
          overviewData?.inventoryStatusDistribution?.lowStock ??
            kpisFromApi.lowStockItemsCount ??
            0
        ),
        stockoutRiskItemsCount: Number(kpisFromApi.stockoutRiskItemsCount ?? 0),
      };

      // Generate sparklines from trend arrays
      const generateSparklines = () => {
        const trends = kpisFromApi.trends || {};
        return {
          units: extractArray(trends.totalInventoryUnits || []).map((v) => ({
            value: Number(v ?? 0),
          })),
          value: extractArray(trends.totalInventoryValue || []).map((v) => ({
            value: Number(v ?? 0),
          })),
          movement: extractArray(trends.netStockMovement || []).map((v) => ({
            value: Number(v ?? 0),
          })),
          profit: extractArray(trends.grossProfit || []).map((v) => ({
            value: Number(v ?? 0),
          })),
        };
      };
      const kpiSparklines = generateSparklines();

      // Status distribution: convert object to array of { name, value }
      const statusObj = overviewData?.inventoryStatusDistribution || {};
      const statusDistribution = [
        { name: "In Stock", value: Number(statusObj.inStock ?? 0) },
        { name: "Low Stock", value: Number(statusObj.lowStock ?? 0) },
        { name: "Out of Stock", value: Number(statusObj.outOfStock ?? 0) },
        { name: "Overstocked", value: Number(statusObj.overstocked ?? 0) },
        { name: "Reserved", value: Number(statusObj.reserved ?? 0) },
      ].filter((s) => s.value > 0);

      // Value distribution by category
      const valueDistributionByCategory = (
        overviewData?.inventoryValueDistribution?.byCategory || []
      ).map((c) => ({
        name: c.categoryName || c.name || "Unknown",
        value: Number(c.value ?? 0),
      }));

      // Value distribution by shop
      const valueDistributionByShop = (
        overviewData?.inventoryValueDistribution?.byShop || []
      ).map((s) => {
        const shopId = s.shopId || s.id || s._id;
        return {
          name: s.shopName || s.name || shopId || "Unknown",
          shopId: shopId,
          value: Number(s.value ?? 0),
        };
      });

      // Value distribution by status
      const valueDistributionByStatus = (
        overviewData?.inventoryValueDistribution?.byStatus || []
      ).map((s) => ({
        name: s.status || "Unknown",
        value: Number(s.value ?? 0),
      }));

      // Movement trend mapping
      const movementTrend = (overviewData?.inventoryMovementTrend || []).map(
        (d, i) => ({
          month: d.date || `Day ${i + 1}`,
          stockIn: Number(d.stockIn ?? 0),
          stockOut: Number(d.stockOut ?? 0),
          netChange: Number(d.netMovement ?? 0),
        })
      );

      // Heatmap conversion: convert {dayOfWeek:1-7, hour} into 28-slot intensity array
      const heatmapRaw = overviewData?.inventoryMovementHeatmap || [];
      const heatmapSlots = Array.from({ length: 28 }).fill(0);
      heatmapRaw.forEach((h) => {
        const dayIdx = (Number(h.dayOfWeek ?? 1) - 1 + 7) % 7; // 0-6 (Mon-Sun)
        const hour = Number(h.hour ?? 0);
        const timeBlock = Math.min(3, Math.max(0, Math.floor(hour / 6))); // 0-3 (Morning/Noon/Evening/Night)
        const idx = dayIdx * 4 + timeBlock; // day-major: 7 days × 4 time blocks
        heatmapSlots[idx] += Number(h.quantityMoved ?? h.in ?? h.out ?? 0);
      });
      const heatmapMax = Math.max(...heatmapSlots, 1);
      const heatmapData = heatmapSlots.map((v) =>
        Math.round((v / heatmapMax) * 100)
      );

      // Financial (profit/cost/revenue) chart
      const financialChartData = (overviewData?.profitCostTrend || []).map(
        (d, i) => ({
          month: d.date || `Day ${i + 1}`,
          revenue: Number(d.revenue ?? 0),
          cost: Number(d.cost ?? 0),
          profit: Number(d.profit ?? 0),
        })
      );

      // Inventory value trend
      const valueTrends = (overviewData?.inventoryValueTrend || []).map(
        (d) => ({
          month: d.date || "",
          value: Number(d.totalValue ?? 0),
        })
      );

      // Top products by profit
      const topProducts = (overviewData?.topProductsByProfit || []).map(
        (p) => ({
          id: p.productId || p._id,
          name: p.productName || p.name || "",
          unitsSold: Number(p.unitsSold ?? 0),
          revenue: Number(p.revenue ?? 0),
          profit: Number(p.grossProfit ?? 0),
          stock: Number(p.currentStock ?? 0),
        })
      );

      // Stockout risk products - compute burn/remaining days defensively
      const riskProducts = (overviewData?.stockoutRiskProducts || []).map(
        (r) => {
          const stock = Number(r.currentStock ?? r.totalStock ?? 0);
          const burn = Number(r.avgDailySales ?? r.burnRate ?? 0);
          const derivedRemaining = burn > 0 ? Math.round(stock / burn) : null;
          return {
            id: r.productId || r._id || Math.random(),
            name: r.productName || r.name || "",
            stock,
            burnRate: burn,
            remainingDays:
              r.daysUntilStockout ??
              r.remainingDays ??
              derivedRemaining ??
              null,
          };
        }
      );

      // Stock status over time (health history)
      const health =
        (overviewData?.stockStatusOverTime || []).length > 0
          ? overviewData.stockStatusOverTime.map((h, i) => ({
              month: h.date || `Day ${i + 1}`,
              inStock: Number(h.inStock ?? 0),
              lowStock: Number(h.lowStock ?? 0),
              outOfStock: Number(h.outOfStock ?? 0),
            }))
          : [{ month: "Now", inStock: 0, lowStock: 0, outOfStock: 0 }];

      // Shop performance
      const shopPerformance = (overviewData?.shopPerformance || []).map(
        (s) => ({
          name: s.shopName || s.name || "Unknown",
          shopId: s.shopId || s.id,
          revenue: Number(s.grossProfit ?? 0),
          units: Number(s.inventoryValue ?? 0),
          turnover: Number(s.stockTurnoverRate ?? 0),
          stockoutRate: Number(s.stockoutRate ?? 0),
        })
      );

      // Calculate global stock turnover rate
      let globalStockTurnoverRate = 0;
      if (shopPerformance.length > 0) {
        const totalValue = shopPerformance.reduce(
          (acc, s) => acc + (s.units || 0),
          0
        );
        if (totalValue > 0) {
          globalStockTurnoverRate =
            shopPerformance.reduce(
              (acc, s) => acc + (s.turnover || 0) * (s.units || 0),
              0
            ) / totalValue;
        } else {
          // Fallback to simple average if no value data
          globalStockTurnoverRate =
            shopPerformance.reduce((acc, s) => acc + (s.turnover || 0), 0) /
            shopPerformance.length;
        }
      }
      kpis.stockTurnoverRate = Number(globalStockTurnoverRate.toFixed(2));

      // Recent activities
      const activities = (overviewData?.recentInventoryActivities || []).map(
        (a) => ({
          id: a._id || a.id,
          type: a.type || "STOCK_IN", // STOCK_IN or STOCK_OUT
          productName: a.productName || a.name || "",
          quantity: Number(a.quantity ?? 0),
          shop: a.shopName || a.shopId || "",
          performer: a.performedBy || a.performedByName || "System",
          timestamp: a.createdAt || new Date().toISOString(),
          time: formatActivityTime(a.createdAt),
        })
      );

      // Recent products added
      const recentProducts = (overviewData?.recentProducts || []).map((p) => ({
        id: p.productId || p._id,
        name: p.productName || p.name || "",
        category: p.categoryName || "Uncategorized",
        quantity: Number(p.initialQuantity ?? 0),
        addedBy: p.createdAt ? formatActivityTime(p.createdAt) : "Recently",
      }));

      // Computed summary fields
      const summaryComputed = {
        totalUnits: kpis.totalInventoryUnits,
        totalValue: kpis.totalInventoryValue,
        netMovement: kpis.netStockMovement,
        lowStockCount: kpis.lowStockItemsCount,
      };

      // Store raw API data for debugging
      const _overviewRaw = overviewData;

      // Recent activities mapping
      const recentActivitiesFromApi = (
        overviewData?.recentInventoryActivities ||
        overviewData?.recentActivity ||
        []
      ).map((a) => ({
        id: a.id || a._id || Math.random(),
        type:
          a.type || a.changeType || (a.quantity > 0 ? "STOCK_IN" : "STOCK_OUT"),
        item: a.productName || a.product?.name || a.item || "Product",
        quantity: a.quantity ?? a.qty ?? a.changeAmount ?? 0,
        shop: a.shopName || a.shop || null,
        performedBy: a.performedBy || a.user?.name || a.actor || null,
        time: formatActivityTime(a.createdAt || a.timestamp || a.time),
      }));

      // Update state with all normalized data
      setData({
        summary,
        summaryComputed,
        kpis,
        kpiSparklines,
        statusDistribution,
        valueDistribution:
          valueDistributionByCategory.length > 0
            ? valueDistributionByCategory
            : valueDistributionByShop,
        valueDistributionByCategory,
        valueDistributionByShop,
        valueDistributionByStatus,
        movementTrend,
        heatmapData,
        financialChartData,
        financialTrend: financialChartData,
        valueTrends,
        topProducts,
        riskProducts,
        shopPerformance,
        activities,
        recentProducts,
        health,
        _overviewRaw,
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
