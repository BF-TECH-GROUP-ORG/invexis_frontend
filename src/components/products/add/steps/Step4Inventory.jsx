"use client";

import { Info } from "lucide-react";

export default function Step4Inventory({ formData, updateFormData }) {
  const handleInventoryChange = (field, value) => {
    updateFormData({
      inventory: {
        ...formData.inventory,
        [field]: value,
      },
    });
  };

  const isLowStock =
    formData.inventory.stockQty > 0 &&
    formData.inventory.lowStockThreshold > 0 &&
    formData.inventory.stockQty < formData.inventory.lowStockThreshold;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Inventory Details
        </h2>
        <p className="text-gray-600">
          Manage stock levels and thresholds for your product
        </p>
      </div>

      {/* Main Stock Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Current Stock Level <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="0"
              value={formData.inventory.stockQty}
              onChange={(e) =>
                handleInventoryChange("stockQty", parseInt(e.target.value) || 0)
              }
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
              required
            />
            <div className="text-gray-500 font-medium">Units</div>
          </div>
          {isLowStock && (
            <div className="mt-3 flex items-center p-2 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <Info className="w-4 h-4 mr-2" />
              Low stock threshold reached!
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inventory.trackQuantity}
                onChange={(e) =>
                  handleInventoryChange("trackQuantity", e.target.checked)
                }
                className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  Track Quantity
                </span>
                <span className="text-xs text-gray-500">
                  Enable automatic stock deduction on sales
                </span>
              </div>
            </label>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inventory.allowBackorder}
                onChange={(e) =>
                  handleInventoryChange("allowBackorder", e.target.checked)
                }
                className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  Allow Backorder
                </span>
                <span className="text-xs text-gray-500">
                  Continue selling when stock is zero
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-2"></div>

      {/* Thresholds & Planning */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          Stock Management Thresholds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventory.lowStockThreshold}
              onChange={(e) =>
                handleInventoryChange(
                  "lowStockThreshold",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-2">
              Trigger alerts when stock reaches this level
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Reorder Qty
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventory.minReorderQty}
              onChange={(e) =>
                handleInventoryChange(
                  "minReorderQty",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended minimum amount for restocking
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Safety Stock
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventory.safetyStock}
              onChange={(e) =>
                handleInventoryChange(
                  "safetyStock",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-2">
              Buffer stock kept to mitigate supply risks
            </p>
          </div>

          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-lg flex flex-col justify-center">
            <div className="text-sm font-semibold text-orange-800">Pro Tip</div>
            <p className="text-xs text-orange-700">
              Set a high safety stock for flagship products during peak seasons
              to avoid stockouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
