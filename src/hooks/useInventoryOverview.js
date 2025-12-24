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
        overviewAnalytics,
      ] = await Promise.all([
        OverviewService.getDashboardData(companyId),
        OverviewService.getCompanyOverview(companyId),
        OverviewService.getInventorySummary(companyId),
        OverviewService.getShops({ companyId }),
        OverviewService.getStockoutRisk({ companyId }),
        OverviewService.getTopProducts({ companyId }),
        OverviewService.getProducts({ companyId, limit: 50 }),
        // fallback: use productsService if OverviewService doesn't return full details
        productsService.getProducts({ companyId, limit: 1000 }),
        OverviewService.getInventoryTrends({ companyId, period: "month" }),
        // New: unified overview analytics endpoint (single source of truth for snapshot/KPIs/trends/activity)
        OverviewService.getOverviewAnalytics({ companyId }),
      ]);

      // Attempt to use the unified overview analytics payload if available
      const overviewPayload =
        (overviewAnalytics &&
          (overviewAnalytics.data || overviewAnalytics?.data?.data)) ||
        null;
      const overviewData =
        overviewPayload?.data ||
        overviewAnalytics?.data ||
        overviewAnalytics ||
        null; // support different shapes

      // Map overview API fields into local variables (prefer overviewData when available)
      const snapshot =
        overviewData?.snapshot ||
        (dashboardData && dashboardData.summary) ||
        {};
      const kpis =
        overviewData?.kpis || (dashboardData && dashboardData.metrics) || {};
      const distributions = overviewData?.distributions || {};
      const trendsFromOverview = overviewData?.trends || null;
      const heatmapFromOverview = overviewData?.heatmap || null;
      const topProductsOverview = overviewData?.topProducts || null;
      const recentActivityOverview = overviewData?.recentActivity || null;
      const shopPerformanceOverview = overviewData?.shopPerformance || null;

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

      // Activities should come from the unified overview payload first; fallback to any previous activity responses if present
      const activities = extractArray(recentActivityOverview || []);
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

      // If unified overview API returned distributions use them (status/value)
      const statusDistribution =
        distributions?.status ||
        inventorySummary?.data?.summary?.statusDistribution ||
        dashboardData.summary?.distribution ||
        [];

      const valueDistribution =
        distributions?.value?.byCategory ||
        computedCategoryDistribution.length > 0
          ? computedCategoryDistribution
          : inventorySummary?.data?.summary?.byCategory ||
            dashboardData.summary?.categoryDistribution ||
            [];

      // trends mapping: prefer the overview trends if present
      const movementsTrend =
        (trendsFromOverview && trendsFromOverview.movements) ||
        trendsArray ||
        [];
      const profitTrend =
        (trendsFromOverview && trendsFromOverview.profit) || null;

      // heatmap: prefer overview heatmap
      const heatmapDataFromApi =
        heatmapFromOverview || dashboardData.heatmap || null;

      // top products and recent activity
      const topProductsFinal =
        topProductsOverview ||
        (topProducts && (topProducts.data || topProducts.items)) ||
        topProducts ||
        [];
      const recentActivity = recentActivityOverview || activities || [];

      // shop performance
      const shopPerformanceFinal =
        shopPerformanceOverview ||
        (shopsList && shopsList.length ? shopsList : []);

      // Sparklines will be computed later (after trendPoints declaration) to avoid duplicate declarations

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
        // Prefer the unified overview payload when present
        summary:
          overviewData?.snapshot ||
          dashboardData.summary ||
          dashboardData.metrics?.summary ||
          {},
        kpis: overviewData?.kpis || kpis || dashboardData.metrics || {},
        // overwrite / complement summary fields with computed values
        summaryComputed: {
          totalValue,
          totalUnits,
          totalProducts,
          lowStockCount:
            (overviewData?.snapshot?.lowStockUnits ??
              inventorySummary?.data?.overview?.lowStockCount) ||
            (dashboardData.lowStock?.length ?? 0) ||
            (dashboardData.summary?.lowStockCount ?? 0),
          netStockMovement:
            (overviewData?.kpis?.netStockMovement ??
              dashboardData.summary?.netStockMovement) ||
            0,
        },
        // Distributions
        statusDistribution:
          distributions?.status ||
          inventorySummary?.data?.summary?.byCategory ||
          dashboardData.summary?.distribution ||
          [],
        valueDistribution:
          distributions?.value?.byCategory ||
          (computedCategoryDistribution.length > 0
            ? computedCategoryDistribution
            : inventorySummary?.data?.summary?.byCategory) ||
          dashboardData.summary?.categoryDistribution ||
          [],
        // Trends & charts
        movementTrend: movementsTrend || processedMovementTrend,
        profitTrend: profitTrend || financialChartData,
        financialTrend: dashboardData.metrics?.graphs?.profitComparison || [],
        financialChartData,
        // Top products & risks
        topProducts:
          topProductsOverview ||
          (topProducts && (topProducts.data || topProducts.items)) ||
          topProducts ||
          [],
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
        shopPerformance: shopPerformanceFinal || [],
        activities: (recentActivity || activities)
          .map((a) => ({
            id: a.id || a._id || Math.random(),
            type: a.type || (a.changeType === "INCREASE" ? "RESTOCK" : "SALE"),
            item: a.productName || a.product?.name || a.item || "Product",
            quantity: a.qty ?? a.quantity ?? a.changeAmount ?? 0,
            time: formatActivityTime(a.timestamp || a.createdAt || a.time),
          }))
          .slice(0, 10),
        recentProducts: recentProducts.map((p) => ({
          id: p.id || p._id || Math.random(),
          name: p.name,
          addedBy: p.createdBy?.name || p.creatorName || "Staff",
        })),
        health:
          overviewData?.health && overviewData.health.length > 0
            ? overviewData.health
            : dashboardData.summary?.statusHistory || healthSeries,
        valueTrends:
          overviewData?.trends?.movements?.map((d) => ({
            month: d.date || d.day || "",
            value: Number(d.stockIn ?? d.netMovement ?? d.value ?? 0),
          })) || valueTrendsProcessed,
        heatmapData: heatmapDataFromApi || aggregateHeatmap(activities),
        // sparklines prefer profit/movement trends from overview
        kpiSparklines: {
          value: sparkValue,
          units: sparkUnits,
          movement: sparkMovement,
          risk: sparkRisk,
        },
        // include raw overview payload for debugging & future use
        _overviewRaw: overviewData,
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
