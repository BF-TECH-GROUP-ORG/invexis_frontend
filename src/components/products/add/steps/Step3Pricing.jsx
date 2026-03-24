"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export default function Step3Pricing({ formData, updateFormData }) {
  const handlePricingChange = (field, value) => {
    const numericValue = value === "" ? null : parseFloat(value);
    const newPricing = {
      ...formData.pricing,
      [field]: numericValue,
    };

    // Automatically sync Sale Price and List Price with Selling Price (basePrice)
    if (field === "basePrice") {
      newPricing.salePrice = numericValue;
      newPricing.listPrice = numericValue;
    }

    updateFormData({ pricing: newPricing });
  };

  const profitMargin = useMemo(() => {
    const { basePrice, cost } = formData.pricing;
    if (basePrice > 0 && cost >= 0) {
      return (((basePrice - cost) / basePrice) * 100).toFixed(2);
    }
    return "0.00";
  }, [formData.pricing.basePrice, formData.pricing.cost]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Pricing Information
        </h2>
        <p className="text-gray-600">
          Set the cost and selling price for your product
        </p>
      </div>

      <div className="space-y-6">
        {/* Cost Price - On Top */}
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
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Selling Price (mapped to basePrice) - Below */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selling Price <span className="text-red-500">*</span>
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
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold"
              placeholder="0.00"
              required
            />
          </div>
        </div>
      </div>

      {/* RWF Notice */}
      <div className="text-sm text-gray-500 text-center">
        All prices are in Rwandan Francs (RWF).
      </div>

      {/* Profit Margin Card */}
      {formData.pricing.basePrice > 0 && formData.pricing.cost >= 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Estimated Profit Margin</span>
            <span className="text-3xl font-bold text-orange-600">
              {profitMargin}%
            </span>
          </div>
          <p className="text-lg text-gray-700">
            Profit per unit:{" "}
            <span className="font-bold">
              FRw {(formData.pricing.basePrice - formData.pricing.cost).toLocaleString()}
            </span>
          </p>
        </div>
      )}

      {/* Hidden Fields */}
      <div className="hidden">
        <input type="hidden" value={formData.pricing.salePrice || ""} />
        <input type="hidden" value={formData.pricing.listPrice || ""} />
      </div>
    </div>
  );
}
