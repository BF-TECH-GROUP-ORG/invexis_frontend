// src/components/inventory/products/ProductFormSteps/StepAdvanced.jsx
"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp } from "lucide-react";
import DiscountSettings from "../ProductFormComponents/DiscountSettings";
import ReturnPolicySettings from "../ProductFormComponents/ReturnPolicySettings";

export default function StepAdvanced({
  formData,
  updateFormData,
  updateNestedField,
  errors
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Status and Visibility */}
      <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          Product Status & Visibility
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => updateFormData({ status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => updateFormData({ visibility: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="public">Public (Visible to all)</option>
              <option value="private">Private (Hidden)</option>
              <option value="featured">Featured Product</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discount Settings */}
      <DiscountSettings
        discount={formData.discount}
        updateNestedField={updateNestedField}
        errors={errors}
      />

      {/* Return Policy Settings */}
      <ReturnPolicySettings
        returnPolicy={formData.returnPolicy}
        updateNestedField={updateNestedField}
      />

      {/* Additional Settings */}
      <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-orange-500" />
          Additional Settings
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTaxable}
              onChange={(e) => updateFormData({ isTaxable: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Product is taxable</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.trackInventory}
              onChange={(e) => updateFormData({ trackInventory: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Track inventory for this product</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowBackorder}
              onChange={(e) => updateFormData({ allowBackorder: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Allow backorders when out of stock</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPerishable}
              onChange={(e) => updateFormData({ isPerishable: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Product is perishable</span>
          </label>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          SEO Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Meta Title <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={formData.seo?.metaTitle || ""}
              onChange={(e) => updateNestedField("seo", "metaTitle", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="SEO Title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Meta Description <span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea
              value={formData.seo?.metaDescription || ""}
              onChange={(e) => updateNestedField("seo", "metaDescription", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="SEO Description"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Keywords (comma separated) <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={(formData.seo?.keywords || []).join(", ")}
              onChange={(e) => updateNestedField("seo", "keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="keyword1, keyword2"
            />
          </div>
        </div>
      </div>

      {/* Video URLs */}
      <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
        <h3 className="font-semibold mb-4">Video URLs <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
        <div className="space-y-3">
          {(formData.videoUrls || []).map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const newUrls = [...(formData.videoUrls || [])];
                  newUrls[index] = e.target.value;
                  updateFormData({ videoUrls: newUrls });
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://youtube.com/..."
              />
              <button
                onClick={() => {
                  const newUrls = (formData.videoUrls || []).filter((_, i) => i !== index);
                  updateFormData({ videoUrls: newUrls });
                }}
                className="text-red-500 hover:text-red-700 font-bold px-2"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() => updateFormData({ videoUrls: [...(formData.videoUrls || []), ""] })}
            className="text-sm text-orange-600 font-semibold hover:text-orange-700"
          >
            + Add Video URL
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold mb-2">Internal Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="Any internal notes about this product..."
        />
      </div>
    </motion.div>
  );
}