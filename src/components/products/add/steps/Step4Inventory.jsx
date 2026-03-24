"use client";

import { Info } from "lucide-react";

export default function Step4Inventory({ formData, updateFormData }) {
  const handleInventoryChange = (field, value) => {
    const numericValue = parseInt(value) || 0;
    const newInventory = {
      ...formData.inventory,
      [field]: numericValue,
    };

    // Automatically sync Min Reorder Qty with Low Stock Threshold
    if (field === "lowStockThreshold") {
      newInventory.minReorderQty = numericValue;
    }

    updateFormData({ inventory: newInventory });
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
          Set your stock levels and low stock alerts
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Current Stock Level */}
        <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Stock Level <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="0"
              value={formData.inventory.stockQty}
              onChange={(e) =>
                handleInventoryChange("stockQty", e.target.value)
              }
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="0"
              required
            />
            <span className="text-gray-500 font-bold text-lg">Units</span>
          </div>
          {isLowStock && (
            <div className="mt-3 flex items-center p-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
              <Info className="w-4 h-4 mr-2" />
              Low stock threshold reached
            </div>
          )}
        </div>

        {/* Low Stock Threshold */}
        <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Low Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory.lowStockThreshold}
            onChange={(e) =>
              handleInventoryChange("lowStockThreshold", e.target.value)
            }
            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-xl font-semibold focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="0"
          />
          <p className="text-sm text-gray-500 mt-2 italic">We will alert you when stock drops below this level.</p>
        </div>
      </div>

      {/* Hidden Fields */}
      <div className="hidden">
        <input type="checkbox" checked={true} readOnly name="trackQuantity" />
        <input type="checkbox" checked={true} readOnly name="allowBackorder" />
        <input type="hidden" value={formData.inventory.minReorderQty} />
        <input type="hidden" value={formData.inventory.safetyStock} />
      </div>
    </div>
  );
}
