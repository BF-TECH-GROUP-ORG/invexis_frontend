// src/components/inventory/stock/StockLookup.jsx
"use client";

import React, { useState } from "react";
import { Search, Package, QrCode, AlertCircle, CheckCircle } from "lucide-react";
import { lookupProduct } from "@/services/stockService";

export default function StockLookup({ onProductFound = () => { } }) {
    const [scanInput, setScanInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!scanInput.trim()) return;

        setLoading(true);
        setError(null);
        setProduct(null);

        try {
            const result = await lookupProduct({ code: scanInput.trim() });
            const foundProduct = result?.data || result;
            setProduct(foundProduct);
            onProductFound(foundProduct);
        } catch (err) {
            setError(err.response?.data?.message || "Product not found");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setScanInput("");
        setProduct(null);
        setError(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <QrCode size={20} className="text-orange-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Product Lookup</h3>
                    <p className="text-sm text-gray-500">Scan or enter QR/Barcode</p>
                </div>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="Scan barcode or enter product code..."
                        className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        autoFocus
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading || !scanInput.trim()}
                        className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                Lookup Product
                            </>
                        )}
                    </button>
                    {(product || error) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {/* Error State */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-medium text-red-800">Product Not Found</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {/* Product Found */}
            {product && (
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-sm font-medium text-green-800">Product Found</p>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-green-100">
                        <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={24} className="text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 truncate">{product.name || product.ProductName}</h4>
                            <p className="text-sm text-gray-500">SKU: {product.sku || product.SKU || "N/A"}</p>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">
                                    Stock: <strong className="text-gray-900">{product.inventory?.quantity ?? product.stock ?? 0}</strong>
                                </span>
                                <span className="text-sm text-gray-600">
                                    Price: <strong className="text-orange-600">
                                        {(product.pricing?.basePrice ?? product.price ?? 0).toLocaleString()} RWF
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
