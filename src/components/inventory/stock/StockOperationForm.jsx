// src/components/inventory/stock/StockOperationForm.jsx
"use client";

import React, { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Package, Loader2 } from "lucide-react";
import { stockIn, stockOut } from "@/services/stockService";

export default function StockOperationForm({ product = null, onSuccess = () => { } }) {
    const [operationType, setOperationType] = useState("in");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const reasons = {
        in: ["Restock", "Return", "Transfer In", "Adjustment", "Other"],
        out: ["Sale", "Damaged", "Expired", "Transfer Out", "Lost", "Other"],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product || !quantity || Number(quantity) <= 0) return;

        setLoading(true);
        setMessage(null);

        const payload = {
            productId: product._id || product.id,
            quantity: Number(quantity),
            reason,
            notes,
        };

        try {
            if (operationType === "in") {
                await stockIn(payload);
                setMessage({ type: "success", text: `Added ${quantity} units to inventory` });
            } else {
                await stockOut(payload);
                setMessage({ type: "success", text: `Removed ${quantity} units from inventory` });
            }
            setQuantity("");
            setReason("");
            setNotes("");
            onSuccess();
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Operation failed"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-orange-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Stock Operation</h3>
                    <p className="text-sm text-gray-500">Add or remove inventory</p>
                </div>
            </div>

            {/* Operation Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                    type="button"
                    onClick={() => setOperationType("in")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium transition-all ${operationType === "in"
                            ? "bg-white text-green-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    <ArrowDownCircle size={18} />
                    Stock In
                </button>
                <button
                    type="button"
                    onClick={() => setOperationType("out")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium transition-all ${operationType === "out"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    <ArrowUpCircle size={18} />
                    Stock Out
                </button>
            </div>

            {/* Selected Product */}
            {product ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                    <p className="text-sm text-gray-500">Selected Product</p>
                    <p className="font-medium text-gray-900">{product.name || product.ProductName}</p>
                    <p className="text-xs text-gray-500">Current Stock: {product.inventory?.quantity ?? product.stock ?? 0}</p>
                </div>
            ) : (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg mb-4 text-center">
                    <p className="text-sm text-orange-700">Please scan or lookup a product first</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                        required
                    >
                        <option value="">Select reason</option>
                        {reasons[operationType].map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 resize-none"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !product || !quantity}
                    className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${operationType === "in"
                            ? "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300"
                            : "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300"
                        } disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {operationType === "in" ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                            {operationType === "in" ? "Add Stock" : "Remove Stock"}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
