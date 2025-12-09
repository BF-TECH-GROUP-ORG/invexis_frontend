// src/components/inventory/discounts/DiscountCard.jsx
"use client";

import React from "react";
import { Percent, Calendar, Tag, MoreVertical, Power, Edit, Trash2 } from "lucide-react";

export default function DiscountCard({
    discount,
    onEdit = () => { },
    onDelete = () => { },
    onToggle = () => { }
}) {
    const isActive = discount.status === "active";
    const isExpired = discount.endDate && new Date(discount.endDate) < new Date();

    const formatDate = (date) => {
        if (!date) return "No end date";
        return new Date(date).toLocaleDateString("en-US", { dateStyle: "medium" });
    };

    const getTypeLabel = (type) => {
        const types = {
            percentage: "Percentage Off",
            fixed: "Fixed Amount",
            bogo: "Buy One Get One",
            bundle: "Bundle Deal",
        };
        return types[type] || type;
    };

    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isActive && !isExpired ? "border-green-200" : "border-gray-200"
            }`}>
            {/* Header */}
            <div className={`px-5 py-3 flex items-center justify-between ${isActive && !isExpired ? "bg-green-50" : isExpired ? "bg-red-50" : "bg-gray-50"
                }`}>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive && !isExpired
                            ? "bg-green-100 text-green-700"
                            : isExpired
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-200 text-gray-600"
                        }`}>
                        {isExpired ? "Expired" : isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {getTypeLabel(discount.type)}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onToggle(discount._id)}
                        className={`p-1.5 rounded-lg transition-colors ${isActive
                                ? "text-green-600 hover:bg-green-100"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                        title={isActive ? "Deactivate" : "Activate"}
                    >
                        <Power size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(discount)}
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(discount._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{discount.name}</h3>
                        {discount.description && (
                            <p className="text-sm text-gray-500 mt-1">{discount.description}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                            {discount.type === "percentage" ? (
                                <>{discount.value}%</>
                            ) : discount.type === "fixed" ? (
                                <>${discount.value}</>
                            ) : (
                                <>{discount.value}</>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">discount</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Starts: {formatDate(discount.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Ends: {formatDate(discount.endDate)}</span>
                    </div>
                </div>

                {discount.appliedProducts && discount.appliedProducts.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <Tag size={14} className="text-gray-400" />
                        <span>Applied to {discount.appliedProducts.length} products</span>
                    </div>
                )}

                {discount.code && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Discount Code</p>
                        <p className="font-mono font-semibold text-gray-900">{discount.code}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
