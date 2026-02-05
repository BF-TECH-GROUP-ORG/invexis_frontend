"use client";
import { useMemo } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useLocale, useTranslations } from "next-intl";
import { Package, Layers, DollarSign, TrendingUp } from "lucide-react";

/**
 * InventoryOverviewCards - Unified card display matching Sales History design
 * Displays 4 key inventory metrics with sparkline charts and trend indicators
 * Properly handles zero values with flat graph visualization
 */
const InventoryOverviewCards = ({
  snapshot = {},
  kpis = {},
  trends = {},
  history = {},
  isLoading = false
}) => {
  const t = useTranslations("inventoryOverview.snapshot");
  const stats = useMemo(() => {
    // Extract history data for sparklines - ensure proper format
    const totalUnitsHistory = Array.isArray(history?.totalUnits)
      ? history.totalUnits.map(h => ({ value: h.value || 0, name: h.name || h.date || '' }))
      : [];

    const availableUnitsHistory = Array.isArray(history?.availableUnits)
      ? history.availableUnits.map(h => ({ value: h.value || 0, name: h.name || h.date || '' }))
      : [];

    const inventoryValueHistory = Array.isArray(history?.inventoryValue)
      ? history.inventoryValue.map(h => ({ value: h.value || 0, name: h.name || h.date || '' }))
      : [];

    const netMovementHistory = Array.isArray(history?.netMovement)
      ? history.netMovement.map(h => ({ value: h.value || 0, name: h.name || h.date || '' }))
      : [];

    return {
      totalUnits: snapshot.totalUnits ?? kpis?.totalInventoryUnits ?? 0,
      availableUnits: snapshot.availableUnits ?? 0,
      inventoryValue: snapshot.totalInventoryValue ?? 0,
      netMovement: kpis?.netStockMovement ?? kpis?.netMovement ?? 0,
      trends: {
        totalUnits: trends?.totalUnits ?? 0,
        availableUnits: trends?.availableUnits ?? 0,
        inventoryValue: trends?.inventoryValue ?? 0,
        netMovement: trends?.netMovement ?? 0,
      },
      history: {
        totalUnits: totalUnitsHistory,
        availableUnits: availableUnitsHistory,
        inventoryValue: inventoryValueHistory,
        netMovement: netMovementHistory,
      }
    };
  }, [snapshot, kpis, trends, history]);

  // Exact same card structure as SalesCards for visual consistency
  const cards = [
    {
      title: t("totalUnits"),
      value: stats.totalUnits,
      trend: stats.trends.totalUnits,
      history: stats.history.totalUnits,
      Icon: Package,
      color: "#8b5cf6", // Purple (matching sales design)
      bgColor: "#f3e8ff",
      key: "total-units",
      isCurrency: false,
    },
    {
      title: t("availableUnits"),
      value: stats.availableUnits,
      trend: stats.trends.availableUnits,
      history: stats.history.availableUnits,
      Icon: Layers,
      color: "#10b981", // Green (matching profit design)
      bgColor: "#ecfdf5",
      key: "available-units",
      isCurrency: false,
    },
    {
      title: t("inventoryValue"),
      value: stats.inventoryValue,
      trend: stats.trends.inventoryValue,
      history: stats.history.inventoryValue,
      Icon: DollarSign,
      color: "#3b82f6", // Blue (matching returned products design)
      bgColor: "#eff6ff",
      key: "inventory-value",
      isCurrency: true,
    },
    {
      title: t("netMovement"),
      value: stats.netMovement,
      trend: stats.trends.netMovement,
      history: stats.history.netMovement,
      Icon: TrendingUp,
      color: "#ef4444", // Red (matching discounts design)
      bgColor: "#fee2e2",
      key: "net-movement",
      isCurrency: false,
    },
  ];

  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
      {isLoading ? (
        [1, 2, 3, 4].map((i) => (
          <StatsCard key={i} isLoading={true} />
        ))
      ) : (
        cards.map((card, index) => (
          <StatsCard
            key={card.key}
            title={card.title}
            value={card.value}
            trend={card.trend}
            history={card.history}
            icon={card.Icon}
            color={card.color}
            bgColor={card.bgColor}
            isCurrency={card.isCurrency}
            index={index}
            locale={locale}
          />
        ))
      )}
    </div>
  );
};

export default InventoryOverviewCards;
