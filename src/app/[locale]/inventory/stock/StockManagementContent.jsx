"use client";

import React, { useState, useEffect } from "react";
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

const tabs = [
  { id: "scanner", label: "Scanner", icon: QrCode },
  { id: "operations", label: "Operations", icon: ArrowRightLeft },
  { id: "history", label: "History", icon: History },
];

export default function StockManagementContent({ companyId }) {
  const [activeTab, setActiveTab] = useState("scanner");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsCache, setProductsCache] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // When navigating from KPI cards, provide an initial filter for the history table
  const [historyInitialFilter, setHistoryInitialFilter] = useState(null);

  useEffect(() => {
    // Fetch and cache products once when entering the stock route
    let mounted = true;
    async function loadProducts() {
      if (!companyId) return;
      setProductsLoading(true);
      try {
        const res = await productsService.getProducts({
          companyId,
          limit: 1000,
        });
        const data = res?.data || res || [];
        if (!mounted) return;
        setProductsCache(data);
      } catch (err) {
        console.error("Failed to load products for stock route", err);
      } finally {
        if (mounted) setProductsLoading(false);
      }
    }

    async function loadSummary() {
      if (!companyId) return;
      try {
        const res = await getDailySummary({ companyId });
        const data = res?.data?.data || res?.data || res || null;
        if (!mounted) return;
        setSummary(data);
      } catch (err) {
        console.error("Failed to load daily summary", err);
      }
    }

    loadProducts();
    loadSummary();

    return () => (mounted = false);
  }, [companyId]);

  const handleProductFound = (product) => {
    setSelectedProduct(product);
    // Auto-switch to operations tab when product is found
    setActiveTab("operations");
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
              Stock Management
            </h1>
            <p className="text-gray-500">
              Manage inventory levels, scan products, and track changes
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
              title: "Total Products",
              value: totalProducts,
              icon: Package,
              color: "#ff782d",
              bgColor: "#fff8f5",
              details: null,
            },
            {
              title: "Stock In Today",
              value: stockInTotal,
              icon: TrendingUp,
              color: "#10b981",
              bgColor: "#f0fdf4",
              details: (summary?.today?.stockIn?.activities || []).slice(0, 2),
            },
            {
              title: "Stock Out Today",
              value: stockOutTotal,
              icon: TrendingDown,
              color: "#ef4444",
              bgColor: "#fff1f2",
              details: (summary?.today?.stockOut?.activities || []).slice(0, 2),
              meta: stockOutRevenue,
            },
            {
              title: "Low Stock Alerts",
              value: lowStockCount,
              icon: Activity,
              color: "#3b82f6",
              bgColor: "#eff6ff",
              details: (summary?.inventory?.lowStock?.items || []).slice(0, 2),
            },
          ];

          return stats.map((stat, index) => {
            const Icon = stat.icon;

            // Generate a small sparkline dataset: prefer explicit series if provided, otherwise derive a simple trend
            const sparkData = (() => {
              if (
                stat.title.includes("Stock In") &&
                summary?.today?.stockIn?.activities
              ) {
                // simple: last 6 days zeros + today's count
                return [
                  0,
                  0,
                  0,
                  0,
                  summary.today.stockIn.activities.length -
                    Math.floor(summary.today.stockIn.activities.length / 2),
                  summary.today.stockIn.activities.length,
                ];
              }
              if (
                stat.title.includes("Stock Out") &&
                summary?.today?.stockOut?.activities
              ) {
                return [
                  0,
                  0,
                  0,
                  0,
                  Math.max(0, summary.today.stockOut.activities.length - 1),
                  summary.today.stockOut.activities.length,
                ];
              }
              if (
                stat.title.includes("Low Stock") &&
                summary?.inventory?.lowStock?.items
              ) {
                return (summary.inventory.lowStock.items || [])
                  .slice(0, 6)
                  .map((i) => i.stockQty || 0);
              }
              // fallback: flat line using value
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
                    <p className="text-xs text-[#6b7280] font-semibold mb-1 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-3xl font-extrabold text-[#081422] mb-2">
                        {stat.value}{" "}
                        {stat.meta != null && (
                          <span className="text-sm text-gray-500 font-normal">
                            {typeof stat.meta === "string"
                              ? `$${stat.meta}`
                              : stat.meta}
                          </span>
                        )}
                      </p>
                      <div className="ml-2">
                        <Sparkline
                          data={sparkData}
                          stroke={stat.color}
                          width={90}
                          height={28}
                        />
                      </div>
                    </div>

                    {stat.details && stat.details.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {stat.title.includes("Low")
                          ? stat.details.map((d) => (
                              <div key={d._id} className="truncate">
                                {d.productName} ({d.stockQty})
                              </div>
                            ))
                          : stat.details.map((d) => (
                              <div key={d._id} className="truncate">
                                {d.reason ||
                                  (d.meta && d.meta.productName) ||
                                  d.productName}{" "}
                                • {d.qty}
                              </div>
                            ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className="p-3 rounded-full shrink-0 mb-3 ring-1 ring-gray-100"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                    {stat.details && stat.details.length > 0 && (
                      <button
                        onClick={() => {
                          setHistoryInitialFilter({
                            type: stat.title.includes("Stock In")
                              ? "in"
                              : stat.title.includes("Stock Out")
                              ? "out"
                              : "all",
                            search: "",
                          });
                          setActiveTab("history");
                        }}
                        className="text-xs text-orange-600 hover:underline"
                      >
                        View all
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
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold uppercase text-sm tracking-wide transition-all ${
                  activeTab === tab.id
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Scan with Mobile
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    Point your mobile app camera at the QR code or barcode below
                    to perform quick stock-out actions from the mobile app.
                  </p>

                  <div className="mt-4 flex flex-col items-center gap-4">
                    {selectedProduct.codes?.qrPayload && (
                      <img
                        alt="Large QR"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                          selectedProduct.codes.qrPayload
                        )}`}
                        className="w-56 h-56 bg-white p-2 rounded-md border"
                      />
                    )}

                    {selectedProduct.codes?.barcodePayload && (
                      <img
                        alt="Large Barcode"
                        src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                          selectedProduct.codes.barcodePayload
                        )}&code=Code128&translate-esc=true`}
                        className="h-28"
                      />
                    )}

                    <div className="w-full mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-gray-700">
                      <strong className="block mb-2">
                        Tips for scanning with a mobile phone
                      </strong>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          Open the mobile app and go to the scanner section.
                        </li>
                        <li>
                          Point the camera steadily at the QR code or barcode
                          and allow it to autofocus.
                        </li>
                        <li>
                          Ensure good lighting and avoid glare on glossy labels.
                        </li>
                        <li>
                          If scanning a barcode, align it horizontally across
                          the camera frame.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quick Tips
                      </h3>
                      <p className="text-sm text-gray-500">
                        How to use the scanner
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        1
                      </span>
                      <span>Connect a barcode scanner or use your camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        2
                      </span>
                      <span>Scan the product barcode or QR code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        3
                      </span>
                      <span>Product details will appear automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        4
                      </span>
                      <span>Proceed to add or remove stock</span>
                    </li>
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedProduct.name ||
                      selectedProduct.productName ||
                      selectedProduct.ProductName ||
                      "Product"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    SKU:{" "}
                    {selectedProduct.sku ||
                      selectedProduct.productSku ||
                      selectedProduct._id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Current Stock:{" "}
                    {selectedProduct.inventory?.quantity ??
                      selectedProduct.stock?.available ??
                      selectedProduct.stock ??
                      "—"}
                  </p>
                  {selectedProduct.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedProduct.description}
                    </p>
                  )}
                  <div className="mt-3">
                    <a
                      href={`/inventory/products/${
                        selectedProduct._id || selectedProduct.id
                      }`}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      Open product
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg mb-4 text-center">
                  <p className="text-sm text-orange-700">
                    Select a product to see details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <StockHistoryTable
            companyId={companyId}
            initialFilter={historyInitialFilter}
          />
        )}
      </div>
    </div>
  );
}
