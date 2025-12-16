// src/components/inventory/products/ProductFormSteps/StepBasicInfo.jsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/features/categories/categoriesSlice";

export default function StepBasicInfo({
  formData,
  updateFormData,
  errors,
  categories = [],
  isLoadingCategories = false,
}) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const dispatch = useDispatch();
  const categoriesState = useSelector((s) => s.categories || {});
  const storeCategories = Array.isArray(categoriesState.items) ? categoriesState.items : [];
  const storeLoading = !!categoriesState.loading;

  useEffect(() => {
    if (safeCategories.length === 0 && storeCategories.length === 0 && !storeLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, safeCategories.length, storeCategories.length, storeLoading]);

  const finalCategories = safeCategories.length > 0 ? safeCategories : storeCategories;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Name & Brand */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition ${errors.name ? "border-red-500" : "border-gray-300"}`}
            placeholder="e.g. Premium Organic Cotton T-Shirt"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.brand || ""}
            onChange={(e) => updateFormData({ brand: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
            placeholder="e.g. EcoWear"
          />
        </div>
      </div>

      {/* Manufacturer & Category */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Manufacturer <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.manufacturer || ""}
            onChange={(e) => updateFormData({ manufacturer: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
            placeholder="e.g. FairTrade Mills Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category || ""}
            onChange={(e) => updateFormData({ category: e.target.value })}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition ${errors.category ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select Category</option>
            {finalCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-[#333] mb-2">
          Tags <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={(formData.tags || []).join(", ")}
          onChange={(e) => updateFormData({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
          placeholder="e.g. organic, cotton, sustainable"
        />
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
            placeholder="Brief summary..."
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition resize-y"
            placeholder="Detailed product description..."
          />
        </div>
      </div>

      {/* Condition & Availability */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">Condition</label>
          <select
            value={formData.condition || 'new'}
            onChange={(e) => updateFormData({ condition: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C] focus:ring-2 focus:ring-orange-100 transition"
          >
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="preorder">Preorder</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}