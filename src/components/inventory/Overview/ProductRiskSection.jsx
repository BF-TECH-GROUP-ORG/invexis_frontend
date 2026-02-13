import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 5;

const ProductRiskSection = ({ topProducts = [], riskProducts = [] }) => {
  const tRisk = useTranslations("inventoryOverview.risk");
  const tTop = useTranslations("inventoryOverview.topPerformers");
  const [topPage, setTopPage] = useState(0);
  const [riskPage, setRiskPage] = useState(0);
  // If both lists are empty, hide the whole section per request
  if ((topProducts?.length || 0) === 0 && (riskProducts?.length || 0) === 0)
    return null;

  const topPages = Math.ceil((topProducts?.length || 0) / PAGE_SIZE) || 1;
  const riskPages = Math.ceil((riskProducts?.length || 0) / PAGE_SIZE) || 1;

  const topSlice = (topProducts || []).slice(
    topPage * PAGE_SIZE,
    topPage * PAGE_SIZE + PAGE_SIZE
  );
  const riskSlice = (riskProducts || []).slice(
    riskPage * PAGE_SIZE,
    riskPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Stockout Risk List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              {tRisk("title")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">
              {tRisk("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory/products"
              className="text-xs text-indigo-600 hover:underline"
            >
              {tRisk("viewAllLabel")}
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="font-bold uppercase tracking-wider py-3 pl-1">
                  {tRisk("table.product")}
                </th>
                <th className="font-bold uppercase tracking-wider py-3 text-center">
                  {tRisk("table.remaining")}
                </th>
                <th className="font-bold uppercase tracking-wider py-3 text-right pr-1">
                  {tRisk("table.burnRate")}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {riskSlice.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="py-4 pl-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white mb-0.5">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {tRisk("inStock", { count: item.stock })}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${item.remainingDays <= 3
                        ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                        : "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30"
                        }`}
                    >
                      {tRisk("days", { count: item.remainingDays })}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-1 font-bold text-gray-600 dark:text-gray-300 font-mono">
                    {tRisk("perDay", { count: item.burnRate })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination for risk products */}
        {riskProducts?.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              {tRisk("pagination", {
                start: riskPage * PAGE_SIZE + 1,
                end: Math.min((riskPage + 1) * PAGE_SIZE, riskProducts.length),
                total: riskProducts.length
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRiskPage((p) => Math.max(0, p - 1))}
                disabled={riskPage === 0}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setRiskPage((p) => Math.min(riskPages - 1, p + 1))
                }
                disabled={riskPage >= riskPages - 1}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Profit Products */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              {tTop("title")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">
              {tTop("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory/products"
              className="text-xs text-indigo-600 hover:underline"
            >
              {tTop("viewAllLabel") || tRisk("viewAllLabel")}
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4">
          {topSlice.map((product, idx) => {
            const index = topPage * PAGE_SIZE + idx;
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-750 hover:border-orange-200 hover:bg-orange-50/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${index < 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-base">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 font-medium mt-0.5">
                      <Package className="w-3 h-3" />
                      {tTop("unitsSold", { count: product.unitsSold })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    +{(Number(product.profit) || 0).toLocaleString()} RWF
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {tTop("profit")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination for top products */}
        {topProducts?.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              {tRisk("pagination", {
                start: topPage * PAGE_SIZE + 1,
                end: Math.min((topPage + 1) * PAGE_SIZE, topProducts.length),
                total: topProducts.length
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTopPage((p) => Math.max(0, p - 1))}
                disabled={topPage === 0}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTopPage((p) => Math.min(topPages - 1, p + 1))}
                disabled={topPage >= topPages - 1}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRiskSection;
