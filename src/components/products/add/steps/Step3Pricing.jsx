"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export default function Step3Pricing({ formData, updateFormData }) {
  const handlePricingChange = (field, value) => {
    updateFormData({
      pricing: {
        ...formData.pricing,
        [field]: value === "" ? null : parseFloat(value),
      },
    });
  };

  const profitMargin = useMemo(() => {
    const { basePrice, cost } = formData.pricing;
    if (basePrice > 0 && cost >= 0) {
      return (((basePrice - cost) / basePrice) * 100).toFixed(2);
    }
    return "0.00";
  }, [formData.pricing.basePrice, formData.pricing.cost]);

  const discountPercentage = useMemo(() => {
    const { basePrice, salePrice } = formData.pricing;
    if (basePrice > 0 && salePrice && salePrice < basePrice) {
      return (((basePrice - salePrice) / basePrice) * 100).toFixed(2);
    }
    return null;
  }, [formData.pricing.basePrice, formData.pricing.salePrice]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Pricing Information
          </h2>
          <p className="text-gray-600">
            Set the pricing details for your product
          </p>
        </div>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              FRw
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.basePrice || ""}
              onChange={(e) => handlePricingChange("basePrice", e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              FRw
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.cost || ""}
              onChange={(e) => handlePricingChange("cost", e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Sale Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sale Price (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              FRw
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.salePrice || ""}
              onChange={(e) => handlePricingChange("salePrice", e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          {discountPercentage && (
            <p className="text-green-600 text-sm mt-1">
              {discountPercentage}% discount
            </p>
          )}
        </div>

        {/* List Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            List Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              FRw
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.listPrice || ""}
              onChange={(e) => handlePricingChange("listPrice", e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* RWF Notice (Background) */}
      <div className="text-xs text-gray-500 mt-1">
        All prices are in Rwandan Francs (RWF).
      </div>


      {/* Profit Margin Card */}
      {formData.pricing.basePrice > 0 && formData.pricing.cost >= 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Profit Margin</span>
            <span className="text-2xl font-bold text-orange-600">
              {profitMargin}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Profit:{" "}
            {formData.pricing.currency === "RWF"
              ? "FRw"
              : formData.pricing.currency === "EUR"
                ? "€"
                : formData.pricing.currency === "GBP"
                  ? "£"
                  : "$"}
            {(formData.pricing.basePrice - formData.pricing.cost).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
