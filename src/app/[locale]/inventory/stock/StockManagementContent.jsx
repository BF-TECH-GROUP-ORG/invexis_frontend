"use client";

import React, { useState } from "react";
import {
    QrCode,
    ArrowRightLeft,
    Layers,
    History,
    Package,
    TrendingUp,
    TrendingDown,
    Activity
} from "lucide-react";
import { StockLookup, StockOperationForm, BulkStockForm, StockHistoryTable } from "@/components/inventory/stock";

const tabs = [
    { id: "scanner", label: "Scanner", icon: QrCode },
    { id: "operations", label: "Operations", icon: ArrowRightLeft },
    { id: "bulk", label: "Bulk Actions", icon: Layers },
    { id: "history", label: "History", icon: History },
];

export default function StockManagementContent({ companyId }) {
    const [activeTab, setActiveTab] = useState("scanner");
    const [selectedProduct, setSelectedProduct] = useState(null);

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
                        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
                        <p className="text-gray-500">Manage inventory levels, scan products, and track changes</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { title: "Total Products", value: "—", icon: Package, color: "#ff782d", bgColor: "#fff8f5" },
                    { title: "Stock In Today", value: "—", icon: TrendingUp, color: "#10b981", bgColor: "#f0fdf4" },
                    { title: "Stock Out Today", value: "—", icon: TrendingDown, color: "#ef4444", bgColor: "#fff1f2" },
                    { title: "Low Stock Alerts", value: "—", icon: Activity, color: "#3b82f6", bgColor: "#eff6ff" },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all cursor-pointer hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-[#6b7280] font-medium mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-[#081422] mb-2">{stat.value}</p>
                                </div>
                                <div
                                    className="p-3 rounded-xl shrink-0"
                                    style={{ backgroundColor: stat.bgColor }}
                                >
                                    <Icon size={24} style={{ color: stat.color }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-300 mb-6">
                <div className="flex border-b border-gray-100">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all ${activeTab === tab.id
                                    ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
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
                        <StockLookup onProductFound={handleProductFound} />
                        <div className="bg-white rounded-xl border border-gray-300 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <QrCode size={20} className="text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Tips</h3>
                                    <p className="text-sm text-gray-500">How to use the scanner</p>
                                </div>
                            </div>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</span>
                                    <span>Connect a barcode scanner or use your camera</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</span>
                                    <span>Scan the product barcode or QR code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">3</span>
                                    <span>Product details will appear automatically</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">4</span>
                                    <span>Proceed to add or remove stock</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === "operations" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StockLookup onProductFound={setSelectedProduct} />
                        <StockOperationForm product={selectedProduct} onSuccess={handleOperationSuccess} />
                    </div>
                )}

                {activeTab === "bulk" && (
                    <BulkStockForm onSuccess={() => { }} />
                )}

                {activeTab === "history" && (
                    <StockHistoryTable companyId={companyId} />
                )}
            </div>
        </div>
    );
}
