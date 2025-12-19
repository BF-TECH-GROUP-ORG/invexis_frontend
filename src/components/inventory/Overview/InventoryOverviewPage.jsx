import React from "react";
import useInventoryOverview from "@/hooks/useInventoryOverview";
import InventoryHeader from "./InventoryHeader";
import InventoryKPISection from "./InventoryKPISection";
import InventoryDistributionSection from "./InventoryDistributionSection";
import InventoryMovementSection from "./InventoryMovementSection";
import InventoryInsightsSection from "./InventoryInsightsSection";
import ProductRiskSection from "./ProductRiskSection";
import InventoryHealthSection from "./InventoryHealthSection"; // Stacked Bar
import InventoryValueTrendSection from "./InventoryValueTrendSection";
import ShopPerformanceSection from "./ShopPerformanceSection";
import InventoryActivitySection from "./InventoryActivitySection";

const InventoryOverviewPage = () => {
  // Hardcoded company ID for now, or get from context/auth
  const companyId = "mock-company-id";
  const { loading, error, data, refetch } = useInventoryOverview(companyId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 animate-pulse font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <InventoryHeader onRefresh={refetch} lastUpdated={new Date()} />
        <InventoryKPISection summary={data.summary} />
        <InventoryDistributionSection
          statusData={data.statusDistribution}
          valueData={data.valueDistribution}
        />
        <InventoryMovementSection data={data.movementTrend} />
        <InventoryInsightsSection financialData={data.financialTrend} />
        <InventoryHealthSection /> {/* Uses mock internal data for now */}
        <InventoryValueTrendSection /> {/* Uses mock internal data for now */}
        <ProductRiskSection
          topProducts={data.topProducts}
          riskProducts={data.riskProducts}
        />
        <ShopPerformanceSection data={data.shopPerformance} />
        <InventoryActivitySection
          activities={data.activities}
          recentProducts={data.recentProducts}
        />
      </div>
    </div>
  );
};

export default InventoryOverviewPage;
