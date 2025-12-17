import { useState, useEffect, useCallback } from "react";
import InventoryService from "@/services/inventoryService";

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
  });

  const fetchAllData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      // Parallel fetching for performance
      const [
        summary,
        statusDistribution,
        valueDistribution,
        movementTrend,
        financialTrend,
        topProducts,
        riskProducts,
        shopPerformance,
        activities,
        recentProducts,
      ] = await Promise.all([
        InventoryService.getSummary(companyId),
        InventoryService.getStatusDistribution(companyId),
        InventoryService.getValueDistribution(companyId),
        InventoryService.getMovementTrend("year"),
        InventoryService.getFinancialTrend("year"),
        InventoryService.getTopProducts(5),
        InventoryService.getStockoutRisks(7),
        InventoryService.getShopPerformance(companyId),
        InventoryService.getRecentActivities(10),
        InventoryService.getRecentProducts(5),
      ]);

      setData({
        summary,
        statusDistribution,
        valueDistribution,
        movementTrend,
        financialTrend,
        topProducts,
        riskProducts,
        shopPerformance,
        activities,
        recentProducts,
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
