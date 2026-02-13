import React from 'react';
import { getCachedSales, getCachedPaymentMethods, getCachedTopProducts, getCachedStockMovement, getCachedProfitability } from '@/services/dashboardCache';
import SalesChartsSection from './SalesChartsSection';

export default async function SalesChartsWrapper({ companyId, params, options, timeRange, selectedDate }) {
  // Parallel server-side data fetching
  const [salesRes, categoriesRes, productsRes, movementRes, profitabilityRes] = await Promise.all([
    getCachedSales(companyId, params, options),
    getCachedPaymentMethods(companyId, params, options),
    getCachedTopProducts(companyId, params, options),
    getCachedStockMovement(companyId, params, options),
    getCachedProfitability(companyId, params, options)
  ]);

  return (
    <SalesChartsSection
        salesRes={salesRes}
        categoriesRes={categoriesRes}
        productsRes={productsRes}
        movementRes={movementRes}
        profitabilityRes={profitabilityRes}
        timeRange={timeRange}
        selectedDate={selectedDate}
    />
  );
}
