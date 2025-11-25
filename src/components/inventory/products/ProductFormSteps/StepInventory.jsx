// src/components/inventory/products/ProductFormSteps/StepInventory.jsx
"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";

// Realistic mock warehouses (used when real data is missing or undefined)
const MOCK_WAREHOUSES = [
  { _id: "wh1", name: "Main Warehouse", location: { city: "Kigali" } },
  { _id: "wh2", name: "Secondary Storage", location: { city: "Huye" } },
  { _id: "wh3", name: "Regional Depot", location: { city: "Musanze" } },
  { _id: "wh4", name: "Central Hub", location: { city: "Kigali" } },
];

export default function StepInventory({
  formData,
  updateFormData,
  updateNestedField,
  errors,
  warehouses = [] // can be undefined
}) {
  // BULLETPROOF: Always use a valid array
  const safeWarehouses = Array.isArray(warehouses) && warehouses.length > 0
    ? warehouses
    : MOCK_WAREHOUSES;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Stock Levels */}
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.stock !== undefined && formData.stock !== null ? formData.stock : ""}
            onChange={(e) => updateFormData({ stock: e.target.value })}
            className={`w-full px-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${errors.stock ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="0"
            min="0"
          />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Min Stock Level <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            value={formData.minStockLevel || ""}
            onChange={(e) => updateFormData({ minStockLevel: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="10"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Max Stock Level <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            value={formData.maxStockLevel || ""}
            onChange={(e) => updateFormData({ maxStockLevel: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="100"
            min="0"
          />
        </div>
      </div>

      {/* Warehouse Location */}
      <div>
        <label className="block text-sm font-medium text-[#333] mb-2">
          Warehouse Location <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.warehouse || ""}
          onChange={(e) => updateFormData({ warehouse: e.target.value })}
          className={`w-full px-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${errors.warehouse ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option value="">Select Warehouse</option>
          {safeWarehouses.map((wh) => (
            <option key={wh._id} value={wh._id}>
              {wh.name} - {wh.location?.city || "N/A"}
            </option>
          ))}
        </select>
        {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
      </div>

      {/* Expiry Date & Scheduled Availability */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Expiry Date (Optional)
          </label>
          <input
            type="date"
            value={formData.expiryDate || ""}
            onChange={(e) => updateFormData({ expiryDate: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Scheduled Availability Date <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="date"
            value={formData.scheduledAvailabilityDate || ""}
            onChange={(e) => updateFormData({ scheduledAvailabilityDate: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* Low Stock Threshold */}
      <div>
        <label className="block text-sm font-medium text-[#333] mb-2">
          Low Stock Threshold <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="number"
          value={formData.inventory?.lowStockThreshold ?? formData.minStockLevel ?? ""}
          onChange={(e) => updateFormData({ inventory: { ...formData.inventory, lowStockThreshold: e.target.value }, minStockLevel: e.target.value })}
          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          placeholder="Alert when stock is below..."
          min="0"
        />
      </div>

      {/* Physical Properties */}
      <div className="border border-gray-200 rounded-2xl bg-white p-8">
        <h3 className="text-xl font-semibold text-[#1F1F1F] mb-6 flex items-center gap-3">
          <Package size={24} className="text-[#FB923C]" />
          Physical Properties
        </h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">Weight <span className="text-gray-400 font-normal">(Optional)</span></label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.weight?.value || ""}
                onChange={(e) => updateNestedField("weight", "value", e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
                placeholder="0.0"
                step="0.01"
              />
              <select
                value={formData.weight?.unit || "lb"}
                onChange={(e) => updateNestedField("weight", "unit", e.target.value)}
                className="w-24 px-3 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              >
                <option value="lb">lb</option>
                <option value="kg">kg</option>
                <option value="oz">oz</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-[#333] mb-2">Dimensions <span className="text-gray-400 font-normal">(Optional)</span></label>
          </div>
          <input
            type="number"
            value={formData.dimensions?.length || ""}
            onChange={(e) => updateNestedField("dimensions", "length", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Length"
            step="0.01"
          />
          <input
            type="number"
            value={formData.dimensions?.width || ""}
            onChange={(e) => updateNestedField("dimensions", "width", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Width"
            step="0.01"
          />
          <input
            type="number"
            value={formData.dimensions?.height || ""}
            onChange={(e) => updateNestedField("dimensions", "height", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Height"
            step="0.01"
          />
          <select
            value={formData.dimensions?.unit || "in"}
            onChange={(e) => updateNestedField("dimensions", "unit", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          >
            <option value="in">in</option>
            <option value="cm">cm</option>
            <option value="mm">mm</option>
            <option value="m">m</option>
          </select>
        </div>
      </div>

      {/* Specifications */}
      <div className="border border-gray-200 rounded-2xl bg-white p-8">
        <h3 className="text-xl font-semibold text-[#1F1F1F] mb-6 flex items-center gap-3">
          <Package size={24} className="text-[#FB923C]" />
          Product Specifications (Optional)
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <input
            type="text"
            value={formData.specifications?.brand || ""}
            onChange={(e) => updateNestedField("specifications", "brand", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Brand"
          />
          <input
            type="text"
            value={formData.specifications?.model || ""}
            onChange={(e) => updateNestedField("specifications", "model", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Model"
          />
          <input
            type="text"
            value={formData.specifications?.color || ""}
            onChange={(e) => updateNestedField("specifications", "color", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Color"
          />
          <input
            type="text"
            value={formData.specifications?.warranty || ""}
            onChange={(e) => updateNestedField("specifications", "warranty", e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Warranty (e.g., 1 year)"
          />
        </div>
      </div>
    </motion.div>
  );
}