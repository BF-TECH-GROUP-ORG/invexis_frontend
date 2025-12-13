// src/components/inventory/stock/BulkStockForm.jsx
"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, Loader2, Package } from "lucide-react";
import { bulkStockIn, bulkStockOut } from "@/services/stockService";

export default function BulkStockForm({ onSuccess = () => { } }) {
    const [operationType, setOperationType] = useState("in");
    const [items, setItems] = useState([{ productId: "", sku: "", quantity: "", reason: "" }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const reasons = {
        in: ["Restock", "Return", "Transfer In", "Adjustment"],
        out: ["Sale", "Damaged", "Expired", "Transfer Out", "Lost"],
    };

    const addItem = () => {
        setItems([...items, { productId: "", sku: "", quantity: "", reason: "" }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validItems = items.filter(item => item.sku && item.quantity && Number(item.quantity) > 0);
        if (validItems.length === 0) {
            setMessage({ type: "error", text: "Please add at least one valid item" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload = validItems.map(item => ({
                sku: item.sku,
                productId: item.productId,
                quantity: Number(item.quantity),
                reason: item.reason,
            }));

            if (operationType === "in") {
                await bulkStockIn(payload);
                setMessage({ type: "success", text: `Successfully added stock for ${validItems.length} items` });
            } else {
                await bulkStockOut(payload);
                setMessage({ type: "success", text: `Successfully removed stock for ${validItems.length} items` });
            }
            setItems([{ productId: "", sku: "", quantity: "", reason: "" }]);
            onSuccess();
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Bulk operation failed"
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
                    <h3 className="text-lg font-semibold text-gray-900">Bulk Stock Operation</h3>
                    <p className="text-sm text-gray-500">Add or remove multiple items at once</p>
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
                    Bulk Stock In
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
                    Bulk Stock Out
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                    type="text"
                                    placeholder="SKU / Barcode"
                                    value={item.sku}
                                    onChange={(e) => updateItem(index, "sku", e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                                    required
                                />
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Quantity"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                                    required
                                />
                                <select
                                    value={item.reason}
                                    onChange={(e) => updateItem(index, "reason", e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                                >
                                    <option value="">Select reason</option>
                                    {reasons[operationType].map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Product ID (optional)"
                                    value={item.productId}
                                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Item Button */}
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Add Another Item
                </button>

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
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${operationType === "in"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {operationType === "in" ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                            {operationType === "in" ? "Execute Bulk Stock In" : "Execute Bulk Stock Out"}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
