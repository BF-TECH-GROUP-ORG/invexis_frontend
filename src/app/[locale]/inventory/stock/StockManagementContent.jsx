"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  QrCode,
  ArrowRightLeft,
  History,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import productsService from "@/services/productsService";
import { getDailySummary } from "@/services/stockService";
import {
  StockLookup,
  StockOperationForm,
  StockHistoryTable,
} from "@/components/inventory/stock";
import Sparkline from "@/components/visuals/Sparkline";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const getTabs = (t) => [
  { id: "scanner", label: t("tabs.scanner"), icon: QrCode },
  { id: "operations", label: t("tabs.operations"), icon: ArrowRightLeft },
  { id: "history", label: t("tabs.history"), icon: History },
];

export default function StockManagementContent({ initialParams = {} }) {
  const t = useTranslations("stockManagement");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Sync state with URL params
  const activeTab = searchParams.get("tab") || initialParams.tab || "scanner";

  // Helper to update filters/state in URL
  const updateFilters = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const setTab = (tabId) => updateFilters({ tab: tabId });

  // Prepare query options
  const options = useMemo(() => session?.accessToken ? {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  } : {}, [session?.accessToken]);

  // Query for daily summary
  const { data: summaryRes } = useQuery({
    queryKey: ["daily-summary", companyId],
    queryFn: () => getDailySummary({ companyId }, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 5 * 1000 * 60,
  });

  const summary = summaryRes?.data?.data || summaryRes?.data || summaryRes || null;

  // Query for products cache
  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ["products-cache", companyId],
    queryFn: () => productsService.getProducts({ companyId, limit: 1000 }, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 10 * 1000 * 60,
  });

  const productsCache = productsRes?.data || productsRes || [];

  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductFound = (product) => {
    setSelectedProduct(product);
    // Auto-switch to operations tab when product is found
    setTab("operations");
  };

  const handleOperationSuccess = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("header.title")}
            </h1>
            <p className="text-gray-500">
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {(() => {
          const totalProducts = summary?.inventory?.totalUniqueProducts ?? "—";
          const stockInTotal = summary?.today?.stockIn?.totalItems ?? "—";
          const stockOutTotal = summary?.today?.stockOut?.totalItems ?? "—";
          const stockOutRevenue = summary?.today?.stockOut?.revenue ?? null;
          const lowStockCount = summary?.inventory?.lowStock?.count ?? "—";

          const stats = [
            {
              title: t("stats.totalProducts"),
              value: totalProducts,
              icon: Package,
              color: "#ff782d",
              bgColor: "#fff8f5",
              details: null,
            },
            {
              title: t("stats.stockInToday"),
              value: stockInTotal,
              icon: TrendingUp,
              color: "#10b981",
              bgColor: "#f0fdf4",
              details: (summary?.today?.stockIn?.activities || []).slice(0, 2),
            },
            {
              title: t("stats.stockOutToday"),
              value: stockOutTotal,
              icon: TrendingDown,
              color: "#ef4444",
              bgColor: "#fff1f2",
              details: (summary?.today?.stockOut?.activities || []).slice(0, 2),
              meta: stockOutRevenue,
            },
            {
              title: t("stats.lowStockAlerts"),
              value: lowStockCount,
              icon: Activity,
              color: "#3b82f6",
              bgColor: "#eff6ff",
              details: (summary?.inventory?.lowStock?.items || []).slice(0, 2),
            },
          ];

          return stats.map((stat, index) => {
            const Icon = stat.icon;
            const sparkData = (() => {
              if (stat.title.includes("Stock In") && summary?.today?.stockIn?.activities) {
                return [0, 0, 0, 0, summary.today.stockIn.activities.length - Math.floor(summary.today.stockIn.activities.length / 2), summary.today.stockIn.activities.length];
              }
              if (stat.title.includes("Stock Out") && summary?.today?.stockOut?.activities) {
                return [0, 0, 0, 0, Math.max(0, summary.today.stockOut.activities.length - 1), summary.today.stockOut.activities.length];
              }
              if (stat.title.includes("Low Stock") && summary?.inventory?.lowStock?.items) {
                return (summary.inventory.lowStock.items || []).slice(0, 6).map((i) => i.stockQty || 0);
              }
              const v = Number(stat.value) || 0;
              return [v, v, v, v, v, v];
            })();

            return (
              <div
                key={index}
                className="relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-200 transition-all shadow-sm hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div style={{ minWidth: 0 }}>
                    <p className="text-xs text-[#6b7280] font-semibold mb-1 uppercase tracking-wide">{stat.title}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-3xl font-extrabold text-[#081422] mb-2">
                        {stat.value}{" "}
                        {stat.meta != null && (
                          <span className="text-sm text-gray-500 font-normal">
                            {typeof stat.meta === "string" ? `$${stat.meta}` : stat.meta}
                          </span>
                        )}
                      </p>
                      <div className="ml-2">
                        <Sparkline data={sparkData} stroke={stat.color} width={90} height={28} />
                      </div>
                    </div>

                    {stat.details && stat.details.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {stat.title.includes("Low")
                          ? stat.details.map((d) => (<div key={d._id} className="truncate">{d.productName} ({d.stockQty})</div>))
                          : stat.details.map((d) => (<div key={d._id} className="truncate">{d.reason || (d.meta && d.meta.productName) || d.productName} • {d.qty}</div>))
                        }
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="p-3 rounded-full shrink-0 mb-3 ring-1 ring-gray-100" style={{ backgroundColor: stat.bgColor }}>
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                    {stat.details && stat.details.length > 0 && (
                      <button
                        onClick={() => {
                          updateFilters({
                            tab: "history",
                            type: stat.title === t("stats.stockInToday") ? "in" : stat.title === t("stats.stockOutToday") ? "out" : "all",
                            search: "",
                            page: 0
                          });
                        }}
                        className="text-xs text-orange-600 hover:underline"
                      >
                        {t("stats.viewAll")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {getTabs(t).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold uppercase text-sm tracking-wide transition-all ${activeTab === tab.id
                  ? "text-orange-600 border-b-4 border-orange-500 bg-transparent shadow-inner"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "scanner" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockLookup
              onProductFound={handleProductFound}
              productsCache={productsCache}
              productsLoading={productsLoading}
              companyId={companyId}
              displayMode="scanner"
            />
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              {selectedProduct ? (
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t("scanner.scanMobile.title")}</h3>
                  <p className="text-sm text-gray-500 text-center">{t("scanner.scanMobile.subtitle")}</p>
                  <div className="mt-4 flex flex-col items-center gap-4">
                    {selectedProduct.codes?.qrPayload && (
                      <img alt="Large QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedProduct.codes.qrPayload)}`} className="w-56 h-56 bg-white p-2 rounded-md border" />
                    )}
                    {selectedProduct.codes?.barcodePayload && (
                      <img alt="Large Barcode" src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(selectedProduct.codes.barcodePayload)}&code=Code128&translate-esc=true`} className="h-28" />
                    )}
                    <div className="w-full mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-gray-700">
                      <strong className="block mb-2">{t("scanner.scanMobile.tipsTitle")}</strong>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>{t("scanner.scanMobile.tip1")}</li>
                        <li>{t("scanner.scanMobile.tip2")}</li>
                        <li>{t("scanner.scanMobile.tip3")}</li>
                        <li>{t("scanner.scanMobile.tip4")}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><QrCode size={20} className="text-gray-600" /></div>
                    <div><h3 className="text-lg font-semibold text-gray-900">{t("scanner.quickTips.title")}</h3><p className="text-sm text-gray-500">{t("scanner.quickTips.subtitle")}</p></div>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</span><span>{t("scanner.quickTips.step1")}</span></li>
                    <li className="flex items-start gap-2"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</span><span>{t("scanner.quickTips.step2")}</span></li>
                    <li className="flex items-start gap-2"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</span><span>{t("scanner.quickTips.step3")}</span></li>
                    <li className="flex items-start gap-2"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">4</span><span>{t("scanner.quickTips.step4")}</span></li>
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockOperationForm
              product={selectedProduct}
              onSuccess={handleOperationSuccess}
              companyId={companyId}
              productsCache={productsCache}
            />
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              {selectedProduct ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name || selectedProduct.productName || "Product"}</h3>
                  <p className="text-sm text-gray-500">{t("scanner.sku")}: {selectedProduct.sku || selectedProduct.productSku || selectedProduct._id}</p>
                  <p className="text-sm text-gray-500">{t("scanner.stock")}: {selectedProduct.inventory?.quantity ?? selectedProduct.stock?.available ?? selectedProduct.stock ?? "—"}</p>
                  {selectedProduct.description && <p className="mt-2 text-sm text-gray-600">{selectedProduct.description}</p>}
                  <div className="mt-3">
                    <Link href={`/inventory/products/${selectedProduct._id || selectedProduct.id}`} className="text-sm text-orange-600 hover:underline">{t("scanner.openProduct")}</Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg mb-4 text-center">
                  <p className="text-sm text-orange-700">{t("operations.noProductSelected")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <StockHistoryTable
            companyId={companyId}
            initialParams={initialParams}
            updateFilters={updateFilters}
          />
        )}
      </div>
    </div>
  );
}
