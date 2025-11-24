// src/components/inventory/products/ProductFormSteps/StepBasicInfo.jsx
"use client";

import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
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
    const numValue = value === "" ? 0 : Number(value);
    updateFormData({
      currency,
      pricing: { ...pricing, basePrice: numValue },
    });
  };

  const handleCurrencyChange = (newCurrency) => {
    updateFormData({
      currency: newCurrency,
      pricing: { ...pricing, basePrice: pricing.basePrice || 0 },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Product Name & SKU */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className={`w-full px-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., iPhone 13 Pro"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            SKU / Product Code
          </label>
          <input
            type="text"
            value={formData.sku || ""}
            onChange={(e) => updateFormData({ sku: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="Auto-generated if empty"
          />
          <p className="text-xs text-[#666] mt-1">Leave empty for auto-generation</p>
        </div>
      </div>

      {/* UPC & Manufacturer */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">UPC</label>
          <input
            type="text"
            value={formData.upc || ""}
            onChange={(e) => updateFormData({ upc: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="e.g., 017817830452"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">Manufacturer</label>
          <input
            type="text"
            value={formData.manufacturer || ""}
            onChange={(e) => updateFormData({ manufacturer: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="e.g., Bose Corporation"
          />
        </div>
      </div>

      {/* Bullet Points */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-[#333] mb-2">Bullet Points (one per line)</label>
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
          <label className="block text-sm font-medium text-[#333] mb-2">Brand</label>
          <input
            type="text"
            value={formData.brand || ""}
            onChange={(e) => updateFormData({ brand: e.target.value })}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
            placeholder="e.g., Apple, Samsung"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">Tags</label>
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
          className={`w-full px-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${
            errors.category ? "border-red-500" : "border-gray-300"
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

      {/* Currency + Price */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="RWF">RWF - Rwandan Franc</option>
          </select>
        </div>

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
              value={pricing.basePrice ?? ""}
              onChange={(e) => handlePriceChange(e.target.value)}
              className={`w-full pl-24 pr-5 py-4 border rounded-xl focus:outline-none focus:border-[#FB923C] focus:ring-4 focus:ring-orange-100 transition ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>
    </motion.div>
  );
}