// src/components/inventory/shop/ShopInventoryCard.jsx
"use client";

import React from "react";
import { Edit, Trash2, CheckCircle, XCircle, Tag } from "lucide-react";

export default function ShopInventoryCard({
  item,
  onEdit = () => { },
  onDelete = () => { },
  onToggleLowStock = () => { }
}) {
  const isLow = item.lowStock;
  const formatNumber = (num) => num?.toLocaleString() ?? "-";

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isLow ? "border-red-200" : "border-gray-200"
      }`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between ${isLow ? "bg-red-50" : "bg-gray-50"
        }`}>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
            {isLow ? "Low Stock" : "In Stock"}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            {item.product?.category || "Uncategorized"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleLowStock(item._id)}
            className={`p-1.5 rounded-lg transition-colors ${isLow ? "text-red-600 hover:bg-red-100" : "text-green-600 hover:bg-green-100"
              }`}
            title={isLow ? "Mark as sufficient" : "Mark as low stock"}
          >
            {isLow ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          {item.product?.name || "Unnamed Product"}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Tag size={14} className="text-gray-400" />
            <span>SKU: {item.product?.sku || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Tag size={14} className="text-gray-400" />
            <span>Qty: {formatNumber(item.quantity)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Tag size={14} className="text-gray-400" />
            <span>Location: {item.location || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Tag size={14} className="text-gray-400" />
            <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
