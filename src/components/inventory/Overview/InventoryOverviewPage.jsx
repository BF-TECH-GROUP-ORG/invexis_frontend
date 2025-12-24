"use client";

import React from "react";
import { useSession } from "next-auth/react";
import useInventoryOverview from "@/hooks/useInventoryOverview";
import InventoryHeader from "./InventoryHeader";
import InventoryKPISection from "./InventoryKPISection";
import InventorySnapshotPanel from "./InventorySnapshotPanel";
import InventoryDistributionSection from "./InventoryDistributionSection";
import InventoryMovementSection from "./InventoryMovementSection";
import InventoryInsightsSection from "./InventoryInsightsSection";
import ProductRiskSection from "./ProductRiskSection";
import InventoryHealthSection from "./InventoryHealthSection"; // Stacked Bar
import InventoryValueTrendSection from "./InventoryValueTrendSection";
import ShopPerformanceSection from "./ShopPerformanceSection";
import InventoryActivitySection from "./InventoryActivitySection";

const InventoryOverviewPage = () => {
  const { data: session, status } = useSession();

  // Extract companyId from session
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  const {
    loading: dataLoading,
    error,
    data,
    refetch,
  } = useInventoryOverview(companyId);

  const isLoading = status === "loading" || dataLoading;

  // Loading state is handled by loading.jsx, data should be prefetched
  if (isLoading && !data) {
    return null; // Server-side loading.jsx will show skeleton
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen  dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen  dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-orange-600 mb-2">
            No Company Selected
          </h2>
          <p className="text-gray-500 mb-4">
            Please ensure you are associated with a company to view the
            dashboard.
          </p>
        </div>
      </div>
    );
  }

  const hasDistribution =
    (data?.statusDistribution?.length || 0) > 0 ||
    (data?.valueDistribution?.length || 0) > 0;
  const hasMovement = (data?.movementTrend?.length || 0) > 1;
  const hasInsights =
    (data?.financialChartData?.length || 0) > 1 || Boolean(data?.heatmapData);
  const hasHealth = (data?.health?.length || 0) > 0;
  const hasValueTrends = (data?.valueTrends?.length || 0) > 1;
  const hasProductRisk =
    (data?.topProducts?.length || 0) > 0 ||
    (data?.riskProducts?.length || 0) > 0;
  const hasShops =
    data?.shopPerformance &&
    ((data.shopPerformance.shops && data.shopPerformance.shops.length > 0) ||
      (Array.isArray(data.shopPerformance) && data.shopPerformance.length > 0));
  const hasActivity =
    (data?.activities?.length || 0) > 0 ||
    (data?.recentProducts?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <InventoryHeader
          onRefresh={refetch}
          lastUpdated={
            data?.summary?.lastUpdated ||
            data?.summaryComputed?.lastUpdated ||
            new Date()
          }
        />
        <InventorySnapshotPanel
          snapshot={data?.summary || {}}
          kpis={data?.kpis || {}}
        />
        <InventoryKPISection
          summary={data}
          kpis={data?.kpis}
          sparklines={data.kpiSparklines}
        />
        {hasDistribution && (
          <InventoryDistributionSection
            statusData={data.statusDistribution}
            valueData={data.valueDistribution}
            totalUnits={data.summaryComputed?.totalUnits}
            totalValue={data.summaryComputed?.totalValue}
            companyId={companyId}
          />
        )}
        {hasMovement && <InventoryMovementSection data={data.movementTrend} />}
        {hasInsights && (
          <InventoryInsightsSection
            financialData={data.financialChartData || data.financialTrend}
            heatmapData={data.heatmapData}
          />
        )}
        {hasHealth && <InventoryHealthSection data={data.health} />}
        {hasValueTrends && (
          <InventoryValueTrendSection data={data.valueTrends} />
        )}
        {hasProductRisk && (
          <ProductRiskSection
            topProducts={data.topProducts}
            riskProducts={data.riskProducts}
          />
        )}
        {hasShops && <ShopPerformanceSection data={data.shopPerformance} />}
        {hasActivity && (
          <InventoryActivitySection
            activities={data.activities}
            recentProducts={data.recentProducts}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryOverviewPage;
