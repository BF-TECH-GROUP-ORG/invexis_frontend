"use client";

import { useMemo, useState } from "react";
import { convertCurrency } from "@/services/currencyService";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function Step3Pricing({ formData, updateFormData }) {
  const [isConverting, setIsConverting] = useState(false);

  const handlePricingChange = (field, value) => {
    updateFormData({
      pricing: {
        ...formData.pricing,
        [field]: value === "" ? null : parseFloat(value),
      },
    });
  };

  const handleCurrencyChange = async (newCurrency) => {
    const oldCurrency = formData.pricing.currency;
    if (oldCurrency === newCurrency) return;

    const { basePrice, salePrice, costPrice } = formData.pricing;

    // If no prices set, just switch currency immediately
    if (!basePrice && !salePrice && !costPrice) {
      updateFormData({
        pricing: { ...formData.pricing, currency: newCurrency },
      });
      return;
    }

    setIsConverting(true);
    try {
      // Get conversion rate for 1 unit
      const rate = await convertCurrency(1, oldCurrency, newCurrency);

      if (rate) {
        updateFormData({
          pricing: {
            ...formData.pricing,
            currency: newCurrency,
            basePrice: basePrice
              ? parseFloat((basePrice * rate).toFixed(2))
              : basePrice,
            salePrice: salePrice
              ? parseFloat((salePrice * rate).toFixed(2))
              : salePrice,
            costPrice: costPrice
              ? parseFloat((costPrice * rate).toFixed(2))
              : costPrice,
          },
        });
        toast.success(`Prices converted to ${newCurrency}`);
      } else {
        // API failed or limit reached -> just switch currency
        updateFormData({
          pricing: { ...formData.pricing, currency: newCurrency },
        });
        toast.error(
          "Exchange rate API limit reached. Currency changed but prices preserved."
        );
      }
    } catch (error) {
      console.error("Conversion error:", error);
      updateFormData({
        pricing: { ...formData.pricing, currency: newCurrency },
      });
    } finally {
      setIsConverting(false);
    }
  };

  const profitMargin = useMemo(() => {
    const { basePrice, costPrice } = formData.pricing;
    if (basePrice > 0 && costPrice >= 0) {
      return (((basePrice - costPrice) / basePrice) * 100).toFixed(2);
    }
    return "0.00";
  }, [formData.pricing.basePrice, formData.pricing.costPrice]);

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
        {isConverting && (
          <div className="flex items-center text-orange-600 text-sm bg-orange-50 px-3 py-1 rounded-full">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Converting prices...
          </div>
        )}
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              {formData.pricing.currency === "RWF"
                ? "FRw"
                : formData.pricing.currency === "EUR"
                ? "€"
                : formData.pricing.currency === "GBP"
                ? "£"
                : "$"}
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.basePrice || ""}
              onChange={(e) => handlePricingChange("basePrice", e.target.value)}
              disabled={isConverting}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* List Price (MSRP) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            List Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              {formData.pricing.currency === "RWF"
                ? "FRw"
                : formData.pricing.currency === "EUR"
                ? "€"
                : formData.pricing.currency === "GBP"
                ? "£"
                : "$"}
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.listPrice || ""}
              onChange={(e) => handlePricingChange("listPrice", e.target.value)}
              disabled={isConverting}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="0.00"
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
              {formData.pricing.currency === "RWF"
                ? "FRw"
                : formData.pricing.currency === "EUR"
                ? "€"
                : formData.pricing.currency === "GBP"
                ? "£"
                : "$"}
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.pricing.costPrice || ""}
              onChange={(e) => handlePricingChange("costPrice", e.target.value)}
              disabled={isConverting}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Sale Price (kept outside the grid as it's not part of the 3-column layout) */}
      {/* If you intend to remove Sale Price, delete this block */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sale Price (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
            {formData.pricing.currency === "RWF"
              ? "FRw"
              : formData.pricing.currency === "EUR"
              ? "€"
              : formData.pricing.currency === "GBP"
              ? "£"
              : "$"}
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.pricing.salePrice || ""}
            onChange={(e) => handlePricingChange("salePrice", e.target.value)}
            disabled={isConverting}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
        {discountPercentage && (
          <p className="text-green-600 text-sm mt-1">
            {discountPercentage}% discount
          </p>
        )}
      </div>

      {/* Currency Selection (Full Width since Tax Rate Removed) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          value={formData.pricing.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          disabled={isConverting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="RWF">RWF (FRw)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Changing currency will automatically convert existing prices.
        </p>
      </div>

      {/* Profit Margin Card */}
      {formData.pricing.basePrice > 0 && formData.pricing.costPrice >= 0 && (
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
            {(formData.pricing.basePrice - formData.pricing.costPrice).toFixed(
              2
            )}
          </p>
        </div>
      )}
    </div>
  );
}
