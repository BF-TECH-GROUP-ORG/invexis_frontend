// src/components/inventory/products/ProductFormSteps/StepAdvanced.jsx
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TrendingUp, Settings } from "lucide-react";

export default function StepAdvanced({
  formData,
  updateFormData,
  updateNestedField,
}) {
  const t = useTranslations("products.form");
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
          {t("fields.generalSettings")}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t("fields.status")}</label>
            <select
              value={formData.status || "active"}
              onChange={(e) => updateFormData({ status: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="active">{t("fields.active")}</option>
              <option value="inactive">{t("fields.inactive")}</option>
              <option value="archived">{t("fields.archived")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">{t("fields.visibility")}</label>
            <select
              value={formData.visibility || "public"}
              onChange={(e) => updateFormData({ visibility: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="public">{t("fields.public")}</option>
              <option value="private">{t("fields.private")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">{t("fields.sortOrder")}</label>
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
            <span className="text-sm font-medium">{t("fields.featuredProduct")}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive !== undefined ? formData.isActive : true}
              onChange={(e) => updateFormData({ isActive: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium">{t("fields.isActive")}</span>
          </label>
        </div>
      </div>

      {/* {t("fields.seoSettings")} */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          {t("fields.seoSettings")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t("fields.metaTitle")}</label>
            <input
              type="text"
              value={formData.seo?.metaTitle || ""}
              onChange={(e) => updateNestedField("seo", "metaTitle", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder={t("fields.metaTitlePlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t("fields.metaDescription")}</label>
            <textarea
              value={formData.seo?.metaDescription || ""}
              onChange={(e) => updateNestedField("seo", "metaDescription", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder={t("fields.metaDescriptionPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t("fields.keywords")}</label>
            <input
              type="text"
              value={(formData.seo?.keywords || []).join(", ")}
              onChange={(e) => updateNestedField("seo", "keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder={t("fields.keywordsPlaceholder")}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}