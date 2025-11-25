// src/components/inventory/products/ProductFormSteps/StepBasicInfo.jsx
"use client";

import { motion } from "framer-motion";
import { DollarSign, Barcode, QrCode, Factory } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/features/categories/categoriesSlice";

export default function StepBasicInfo({
  formData,
  updateFormData,
  errors,
  categories = [], // Real API data
  isLoadingCategories = false,
}) {
  // BULLETPROOF: Always array, never crash
  const safeCategories = Array.isArray(categories) ? categories : [];

  const dispatch = useDispatch();
  const categoriesState = useSelector((s) => s.categories || {});
  const storeCategories = Array.isArray(categoriesState.items) ? categoriesState.items : [];
  const storeLoading = !!categoriesState.loading;

  // If no categories were passed via props, fetch from store/api
  useEffect(() => {
    if (safeCategories.length === 0 && storeCategories.length === 0 && !storeLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, safeCategories.length, storeCategories.length, storeLoading]);

  // Prefer prop categories when provided, otherwise use store categories
  const finalCategories = safeCategories.length > 0 ? safeCategories : storeCategories;
  const finalLoading = isLoadingCategories || storeLoading;

  const pricing = formData.pricing || { basePrice: "" };
  const currency = formData.currency || "USD";

  const handlePriceChange = (value) => {
    // Pass raw value to allow typing decimals and empty string
    updateFormData({
      currency,
      pricing: { ...pricing, basePrice: value },
    });
  };

  const handleCurrencyChange = (newCurrency) => {
    updateFormData({
      currency: newCurrency,
      pricing: { ...pricing, basePrice: pricing.basePrice },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Basic Identifiers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#333] mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className={`w-full px-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${errors.name ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.sku || ""}
              onChange={(e) => updateFormData({ sku: e.target.value })}
              className={`w-full pl-12 pr-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${errors.sku ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="PROD-001"
            />
          </div>
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            UPC / Barcode <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.upc || ""}
              onChange={(e) => updateFormData({ upc: e.target.value })}
              className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              placeholder="123456789012"
            />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Short Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.description?.short || ""}
            onChange={(e) => updateFormData({ description: { ...formData.description, short: e.target.value } })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Brief summary for list views..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Long Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={formData.description?.long || ""}
            onChange={(e) => updateFormData({ description: { ...formData.description, long: e.target.value } })}
            rows={4}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition resize-y"
            placeholder="Detailed product description..."
          />
        </div>
      </div>

      {/* Manufacturer & Supplier */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Manufacturer <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.manufacturer || ""}
              onChange={(e) => updateFormData({ manufacturer: e.target.value })}
              className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              placeholder="Manufacturer Name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Supplier <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.supplier || ""}
              onChange={(e) => updateFormData({ supplier: e.target.value })}
              className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              placeholder="Supplier Name"
            />
          </div>
        </div>
      </div>

      {/* Bullet Points */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-[#333] mb-2">
          Bullet Points (one per line) <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={(formData.bulletPoints || []).join('\n')}
          onChange={(e) => updateFormData({ bulletPoints: e.target.value.split('\n').map(l => l.trim()).filter(Boolean) })}
          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          placeholder={"World-class noise cancellation\n24-hour battery life\nTouch controls"}
          rows={4}
        />
        <p className="text-xs text-[#666] mt-1">Each line becomes a bullet point</p>
      </div>

      {/* Brand & Tags */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.brand || ""}
            onChange={(e) => updateFormData({ brand: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="e.g., Apple, Samsung"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Tags <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={(formData.tags || []).join(", ")}
            onChange={(e) => updateFormData({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="e.g., smartphone, premium, 5G"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-[#333] mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category || ""}
          onChange={(e) => updateFormData({ category: e.target.value })}
          disabled={isLoadingCategories}
          className={`w-full px-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${errors.category ? "border-red-500" : "border-gray-300"
            } ${isLoadingCategories ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <option value="">
            {isLoadingCategories ? "Loading categories..." : "Select Category"}
          </option>
          {finalCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name} {cat.level > 1 && `(Level ${cat.level})`}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>

      {/* Condition & Availability */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">Condition</label>
          <select
            value={formData.condition || 'new'}
            onChange={(e) => updateFormData({ condition: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          >
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">Availability</label>
          <select
            value={formData.availability || 'in_stock'}
            onChange={(e) => updateFormData({ availability: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          >
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="preorder">Preorder</option>
          </select>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Base Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-5 top-4 text-[#666] font-medium text-lg">
              {currency === "RWF" ? "RWF" : "$"}
            </span>
            <input
              type="number"
              value={pricing.basePrice !== undefined && pricing.basePrice !== null ? pricing.basePrice : ""}
              onChange={(e) => handlePriceChange(e.target.value)}
              className={`w-full pl-24 pr-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${errors.price ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Sale Price <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-5 top-4 text-[#666] font-medium text-lg">
              {currency === "RWF" ? "RWF" : "$"}
            </span>
            <input
              type="number"
              value={pricing.salePrice !== undefined && pricing.salePrice !== null ? pricing.salePrice : ""}
              onChange={(e) => updateFormData({ pricing: { ...pricing, salePrice: e.target.value } })}
              className="w-full pl-24 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            List Price (MSRP) <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-5 top-4 text-[#666] font-medium text-lg">
              {currency === "RWF" ? "RWF" : "$"}
            </span>
            <input
              type="number"
              value={pricing.listPrice !== undefined && pricing.listPrice !== null ? pricing.listPrice : ""}
              onChange={(e) => updateFormData({ pricing: { ...pricing, listPrice: e.target.value } })}
              className="w-full pl-24 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Cost (COGS) <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-5 top-4 text-[#666] font-medium text-lg">
              {currency === "RWF" ? "RWF" : "$"}
            </span>
            <input
              type="number"
              value={pricing.cost !== undefined && pricing.cost !== null ? pricing.cost : ""}
              onChange={(e) => updateFormData({ pricing: { ...pricing, cost: e.target.value } })}
              className="w-full pl-24 pr-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Tax Rate (%) <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            value={pricing.taxRate !== undefined && pricing.taxRate !== null ? pricing.taxRate : ""}
            onChange={(e) => updateFormData({ pricing: { ...pricing, taxRate: e.target.value } })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="0"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          >
            <option value="USD">USD ($)</option>
            <option value="RWF">RWF (Frw)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}