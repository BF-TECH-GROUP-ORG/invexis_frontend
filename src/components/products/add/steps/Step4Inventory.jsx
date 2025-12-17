"use client";

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
    formData.inventory.quantity > 0 &&
    formData.inventory.minStockLevel > 0 &&
    formData.inventory.quantity < formData.inventory.minStockLevel;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Inventory Details
        </h2>
        <p className="text-gray-600">Manage stock levels for your product</p>
      </div>

      {/* Current Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          value={formData.inventory.quantity}
          onChange={(e) =>
            handleInventoryChange("quantity", parseInt(e.target.value) || 0)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="0"
          required
        />
        {isLowStock && (
          <p className="text-amber-600 text-sm mt-1 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Low stock warning
          </p>
        )}
      </div>

      {/* Stock Levels */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Stock Level
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory.minStockLevel}
            onChange={(e) =>
              handleInventoryChange(
                "minStockLevel",
                parseInt(e.target.value) || 0
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0"
          />
          <p className="text-gray-500 text-sm mt-1">
            Alerts when stock falls below this
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Stock Level
          </label>
          <input
            type="number"
            min="0"
            value={formData.inventory.maxStockLevel}
            onChange={(e) =>
              handleInventoryChange(
                "maxStockLevel",
                parseInt(e.target.value) || 0
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0"
          />
          <p className="text-gray-500 text-sm mt-1">
            Maximum inventory capacity
          </p>
        </div>
      </div>

      {/* Stock Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Stock Status Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Stock:</span>
            <span
              className={`font-medium ${
                isLowStock ? "text-amber-600" : "text-gray-900"
              }`}
            >
              {formData.inventory.quantity} units
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Min Stock Level:</span>
            <span className="font-medium text-gray-900">
              {formData.inventory.minStockLevel} units
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Max Stock Level:</span>
            <span className="font-medium text-gray-900">
              {formData.inventory.maxStockLevel} units
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
            <span className="text-gray-600">Identifier (SKU):</span>
            <span className="font-medium text-gray-500 italic">
              Auto-generated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
