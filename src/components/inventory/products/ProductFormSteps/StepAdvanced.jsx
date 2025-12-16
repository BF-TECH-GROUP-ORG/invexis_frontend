// src/components/inventory/products/ProductFormSteps/StepAdvanced.jsx
"use client";

import { motion } from "framer-motion";
import { TrendingUp, Settings } from "lucide-react";

export default function StepAdvanced({
  formData,
  updateFormData,
  updateNestedField,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Status & Visibility */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} className="text-orange-500" />
          General Settings
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              value={formData.status || "active"}
              onChange={(e) => updateFormData({ status: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Visibility</label>
            <select
              value={formData.visibility || "public"}
              onChange={(e) => updateFormData({ visibility: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Sort Order</label>
            <input
              type="number"
              value={formData.sortOrder || 0}
              onChange={(e) => updateFormData({ sortOrder: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => updateFormData({ featured: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Featured Product</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive !== undefined ? formData.isActive : true}
              onChange={(e) => updateFormData({ isActive: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Is Active</span>
          </label>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          SEO Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Meta Title</label>
            <input
              type="text"
              value={formData.seo?.metaTitle || ""}
              onChange={(e) => updateNestedField("seo", "metaTitle", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="SEO Title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Meta Description</label>
            <textarea
              value={formData.seo?.metaDescription || ""}
              onChange={(e) => updateNestedField("seo", "metaDescription", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="SEO Description"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Keywords (comma separated)</label>
            <input
              type="text"
              value={(formData.seo?.keywords || []).join(", ")}
              onChange={(e) => updateNestedField("seo", "keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="keyword1, keyword2"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}