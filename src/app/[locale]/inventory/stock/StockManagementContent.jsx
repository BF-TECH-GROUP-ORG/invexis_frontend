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
  Barcode,
  X,
} from "lucide-react";
import productsService from "@/services/productsService";
import { getDailySummary } from "@/services/stockService";
import { getBranches } from "@/services/branches";
import {
  StockLookup,
  ProductCarousel,
  StockOperationForm,
  StockHistoryTable,
} from "@/components/inventory/stock";
import Sparkline from "@/components/visuals/Sparkline";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
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

  // User RBAC
  const userRole = user?.role;
  const assignedDepartments = user?.assignedDepartments || [];
  const isCompanyAdmin = userRole === "company_admin" || userRole === "super_admin";
  const isSalesWorker = assignedDepartments.includes("sales") && !isCompanyAdmin && !assignedDepartments.includes("management");
  const isManagement = assignedDepartments.includes("management") && !isCompanyAdmin;
  
  const type = searchParams.get("type");
  const isMaterialType = type === "material";
  
  // Restore operation permissions for all roles as requested by user
  const canPerformOperations = true; 
  const userShopId = user?.shops?.[0] || user?.branches?.[0];

  // Sync state with URL params
  const activeTab = searchParams.get("tab") || initialParams.tab || "scanner";

  // Helper to update filters/state in URL
  const updateFilters = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    
    // Auto-enforce shopId for sales workers
    if (isSalesWorker && userShopId) {
      params.set("shopId", userShopId);
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "All") {
        params.delete(key);
      } else {``
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router, isSalesWorker, userShopId]);

  const setTab = (tabId) => updateFilters({ tab: tabId });

  // Prepare query options
  const options = useMemo(() => session?.accessToken ? {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  } : {}, [session?.accessToken]);

  // Query for daily summary
  const { data: summaryRes } = useQuery({
    queryKey: ["daily-summary", companyId, isSalesWorker ? userShopId : null],
    queryFn: () => getDailySummary({ companyId, shopId: isSalesWorker ? userShopId : undefined }, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 5 * 1000 * 60,
  });

  const summary = summaryRes?.data?.data || summaryRes?.data || summaryRes || null;

  // Query for products cache
  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ["products-cache", companyId, isSalesWorker ? userShopId : null, isMaterialType],
    queryFn: () => productsService.getProducts({ 
        companyId, 
        limit: 1000, 
        isForSale: isMaterialType ? "false" : "all",
        shopId: isSalesWorker ? userShopId : undefined 
    }, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 10 * 1000 * 60,
  });

  const productsCache = productsRes?.data || productsRes || [];
  
  // Query for branches/shops to get names
  const { data: branchesRes } = useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => getBranches(companyId, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 30 * 1000 * 60,
  });

  const shopNames = useMemo(() => {
    const branches = branchesRes?.data || branchesRes || [];
    return branches.reduce((acc, b) => {
      acc[b._id || b.id] = b.name || b.branchName;
      return acc;
    }, {});
  }, [branchesRes]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [selectedCodeType, setSelectedCodeType] = useState("qr"); // 'qr' or 'barcode'

  const handleProductFound = (product) => {
    setSelectedProduct(product);
  };

  const handleSelectBatchItem = (item) => {
    const found = productsCache.find(p => (p._id || p.id) === item.productId);
    if (found) {
        setSelectedProduct(found);
    }
  };

  const handleOperationSuccess = () => {
    refetchSummary();
    setSelectedProduct(null);
    // Redirect back to scanner after successful batch submit
    setTab("scanner");
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
                            {typeof stat.meta === "number" ? `${stat.meta.toLocaleString()} RWF` : `${stat.meta} RWF`}
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

      {/* Tab Content containers remain mounted to persist state and ensure instant transitions */}
      <div className="space-y-6">
        <div className={activeTab === "scanner" ? "block animate-in fade-in duration-200" : "hidden"}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockLookup
              onProductFound={handleProductFound}
              productsCache={productsCache}
              productsLoading={productsLoading}
              companyId={companyId}
              displayMode="scanner"
              canPerformOperations={canPerformOperations}
              userShopId={userShopId}
              restrictToShop={isSalesWorker}
              shopNames={shopNames}
            />
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              {selectedProduct ? (
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t("scanner.scanMobile.title")}</h3>
                  <p className="text-sm text-gray-500 text-center">{t("scanner.scanMobile.subtitle")}</p>

                  <div className="flex p-1 bg-gray-100 rounded-xl mt-6 w-full max-w-xs">
                    <button
                      onClick={() => setSelectedCodeType("qr")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${selectedCodeType === "qr"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <QrCode size={18} />
                      {t("scanner.scanMobile.qrTab")}
                    </button>
                    <button
                      onClick={() => setSelectedCodeType("barcode")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${selectedCodeType === "barcode"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <Barcode size={18} />
                      {t("scanner.scanMobile.barcodeTab")}
                    </button>
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-4 transition-all duration-300">
                    {selectedCodeType === "qr" ? (
                      selectedProduct.codes?.qrPayload ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedProduct.codes.qrPayload)}`}
                            alt="Product QR"
                            className="w-32 h-32 shadow-sm"
                          />
                          <p className="mt-4 font-mono text-sm text-gray-500 select-all tracking-widest">{selectedProduct.codes.qrPayload}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <QrCode size={48} className="opacity-20 mb-2" />
                          <p className="text-sm italic">QR Code not available</p>
                        </div>
                      )
                    ) : (
                      selectedProduct.codes?.barcodePayload ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(selectedProduct.codes.barcodePayload)}&code=Code128&translate-esc=true`}
                            className="h-32 shadow-sm"
                          />
                          <p className="mt-4 font-mono text-sm text-gray-500 select-all tracking-widest">{selectedProduct.codes.barcodePayload}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <Barcode size={48} className="opacity-20 mb-2" />
                          <p className="text-sm italic">Barcode not available</p>
                        </div>
                      )
                    )}

                    <div className="w-full mt-8 bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-gray-700 shadow-inner">
                      <strong className="mb-2 text-orange-800 flex items-center gap-2">
                        <Activity size={16} />
                        {t("scanner.scanMobile.tipsTitle")}
                      </strong>
                      <ol className="list-decimal list-inside space-y-1 text-orange-900/70">
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
        </div>

        <div className={activeTab === "operations" ? "block animate-in fade-in duration-200" : "hidden"}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockOperationForm
              product={selectedProduct}
              onSuccess={handleOperationSuccess}
              companyId={companyId}
              productsCache={productsCache}
              canPerformOperations={canPerformOperations}
              batchItems={batchItems}
              setBatchItems={setBatchItems}
            />
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
              {selectedProduct || batchItems.length > 0 ? (
                <>
                  {/* Left Column: Batch & Info */}
                  <div className="flex-1 p-6 border-r border-gray-100 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-bold text-gray-900 truncate">
                        {selectedProduct ? (selectedProduct.name || selectedProduct.ProductName) : "Current Batch"}
                       </h3>
                       {batchItems.length > 0 && (
                         <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">
                           {batchItems.length} items
                         </span>
                       )}
                    </div>
                    
                    <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                      {/* Sub-header: Current Product Quick Info if any */}
                      {selectedProduct && (
                        <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                           <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1">Active Selection</p>
                           <p className="text-xs text-gray-600 line-clamp-2">{selectedProduct.description || "No description available."}</p>
                           <div className="mt-3 flex gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Stock</p>
                                 <p className="text-sm font-bold text-gray-900">{selectedProduct?.inventory?.quantity ?? selectedProduct?.stock?.available ?? "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Shop</p>
                                <p className="text-sm font-bold text-gray-900">{shopNames[selectedProduct?.shopId || selectedProduct?.metadata?.shopId] || selectedProduct?.shopId || "-"}</p>
                              </div>
                           </div>
                        </div>
                      )}

                      {/* Scrollable Batch List */}
                      {batchItems.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <History size={12} /> Pending Submission
                          </p>
                          <div className="space-y-2">
                             {batchItems.map((item, idx) => (
                               <div 
                                 key={`${item.productId}-${idx}`} 
                                 onClick={() => handleSelectBatchItem(item)}
                                 className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors group cursor-pointer"
                               >
                                  <div className="min-w-0">
                                     <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                                     <p className="text-[10px] text-gray-500 font-medium">QTY: {item.quantity}</p>
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setBatchItems(prev => prev.filter(p => p.productId !== item.productId));
                                    }}
                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X size={14} />
                                  </button>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedProduct && (
                      <div className="mt-6 pt-4 border-t border-gray-50">
                        <Link 
                          href={`/inventory/products/${selectedProduct._id || selectedProduct.id}`} 
                          className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          <Activity size={16} />
                          {t("scanner.openProduct")}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Image Carousel */}
                  <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-0">
                    {selectedProduct && (
                      <div className="w-full h-full">
                         <ProductCarousel 
                            images={selectedProduct.media?.images || selectedProduct.images || []} 
                            productName={selectedProduct.name}
                         />
                      </div>
                    )}
                    {!selectedProduct && (
                      <div className="text-center p-6 grayscale opacity-20">
                         <Package size={80} className="mx-auto text-gray-400 mb-2" />
                         <p className="text-xs uppercase font-bold tracking-widest text-gray-500">No Product Selected</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                   <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                      <ArrowRightLeft className="text-orange-300" size={32} />
                   </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{t("operations.noProductSelected")}</p>
                  <p className="text-xs text-gray-500 max-w-[200px]">Search for a product or add items to your batch to see details here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={activeTab === "history" ? "block animate-in fade-in duration-200" : "hidden"}>
          <StockHistoryTable
            companyId={companyId}
            initialParams={{ ...initialParams, shopId: isSalesWorker ? userShopId : undefined }}
            updateFilters={updateFilters}
          />
        </div>
      </div>
    </div>
  );
}
