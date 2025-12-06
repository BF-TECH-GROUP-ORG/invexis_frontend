// src/components/inventory/products/ProductFormSteps/StepInventory.jsx
"use client";

import { motion } from "framer-motion";

export default function StepInventory({
  formData,
  updateFormData,
  errors,
}) {
  const pricing = formData.pricing || { basePrice: "", currency: "USD" };
  const inventory = formData.inventory || { trackQuantity: true, allowBackorder: false };

  const handlePriceChange = (field, value) => {
    updateFormData({
      pricing: { ...pricing, [field]: value }
    });
  };

  const handleInventoryChange = (field, value) => {
    updateFormData({
      inventory: { ...inventory, [field]: value }
    });
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "FRW": return "Frw";
      case "KES": return "KSh";
      case "EUR": return "€";
      case "GBP": return "£";
      default: return "$";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      {/* Pricing Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Pricing</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Base Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(pricing.currency)}</span>
              <input
                type="number"
                value={pricing.basePrice}
                onChange={(e) => handlePriceChange("basePrice", e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition ${errors.price ? "border-red-500" : "border-gray-300"}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Sale Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(pricing.currency)}</span>
              <input
                type="number"
                value={pricing.salePrice || ""}
                onChange={(e) => handlePriceChange("salePrice", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              List Price (MSRP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(pricing.currency)}</span>
              <input
                type="number"
                value={pricing.listPrice || ""}
                onChange={(e) => handlePriceChange("listPrice", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Cost (COGS)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(pricing.currency)}</span>
              <input
                type="number"
                value={pricing.cost || ""}
                onChange={(e) => handlePriceChange("cost", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Currency
            </label>
            <select
              value={pricing.currency}
              onChange={(e) => handlePriceChange("currency", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="FRW">FRW (Frw)</option>
              <option value="KES">KES (KSh)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Inventory</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={inventory.quantity !== undefined ? inventory.quantity : ""}
              onChange={(e) => handleInventoryChange("quantity", e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition ${errors.stock ? "border-red-500" : "border-gray-300"}`}
              placeholder="0"
              min="0"
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={inventory.lowStockThreshold || ""}
              onChange={(e) => handleInventoryChange("lowStockThreshold", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
              placeholder="10"
              min="0"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inventory.trackQuantity}
              onChange={(e) => handleInventoryChange("trackQuantity", e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Track Quantity</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inventory.allowBackorder}
              onChange={(e) => handleInventoryChange("allowBackorder", e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Allow Backorder</span>
          </label>
        </div>
      </div>
    </motion.div>
  );
}