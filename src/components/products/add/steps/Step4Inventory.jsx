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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Inventory Details
        </h2>
        <p className="text-gray-600">
          Set your stock levels and management thresholds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Stock Level */}
        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Stock Level <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="0"
              value={formData.inventory.stockQty}
              onChange={(e) =>
                handleInventoryChange("stockQty", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-orange-500"
              placeholder="0"
              required
            />
            <span className="text-gray-500 font-medium">Units</span>
          </div>
          {isLowStock && (
            <div className="mt-2 flex items-center p-2 bg-amber-50 text-amber-700 rounded-lg text-xs">
              <Info className="w-3 h-3 mr-2" />
              Low stock threshold reached
            </div>
          )}
        </div>

        {/* Low Stock Threshold */}
        <div className="p-4 border border-gray-200 rounded-xl bg-white">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Low Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory.lowStockThreshold}
            onChange={(e) =>
              handleInventoryChange("lowStockThreshold", parseInt(e.target.value) || 0)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-2">Alert me when stock is below this</p>
        </div>

        {/* Minimum Reorder Qty */}
        <div className="p-4 border border-gray-200 rounded-xl bg-white">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Min Reorder Qty
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory.minReorderQty}
            onChange={(e) =>
              handleInventoryChange("minReorderQty", parseInt(e.target.value) || 0)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-2">Recommended restock amount</p>
        </div>

        {/* Safety Stock */}
        <div className="p-4 border border-gray-200 rounded-xl bg-white">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Safety Stock
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory.safetyStock}
            onChange={(e) =>
              handleInventoryChange("safetyStock", parseInt(e.target.value) || 0)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-2">Buffer stock for emergencies</p>
        </div>
      </div>

      {/* Hidden Fields */}
      <div className="hidden">
        <input type="checkbox" checked={true} readOnly name="trackQuantity" />
        <input type="checkbox" checked={true} readOnly name="allowBackorder" />
      </div>
    </div>
  );
}
