"use client";

import { Percent } from "lucide-react";

export default function DiscountSettings({ discount, updateNestedField, errors }) {
  const calculateDiscountedPrice = (originalPrice, discountValue, discountType) => {
    if (!originalPrice || !discountValue) return originalPrice;
    
    if (discountType === 'percentage') {
      return (originalPrice - (originalPrice * discountValue / 100)).toFixed(2);
    } else {
      return (originalPrice - discountValue).toFixed(2);
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Percent size={20} className="text-orange-500" />
        Discount Settings (Optional)
      </h3>
      
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={discount.enabled}
            onChange={(e) => updateNestedField('discount', 'enabled', e.target.checked)}
            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
          />
          <span className="text-sm font-medium">Enable discount for this product</span>
        </label>

        {discount.enabled && (
          <div className="space-y-4 pl-8 border-l-4 border-orange-200">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Discount Type
                </label>
                <select
                  value={discount.type}
                  onChange={(e) => updateNestedField('discount', 'type', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={discount.value}
                  onChange={(e) => updateNestedField('discount', 'value', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors?.discountValue ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={discount.type === 'percentage' ? '0-100' : '0.00'}
                  step={discount.type === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={discount.type === 'percentage' ? '100' : undefined}
                />
                {errors?.discountValue && (
                  <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={discount.startDate}
                  onChange={(e) => updateNestedField('discount', 'startDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={discount.endDate}
                  onChange={(e) => updateNestedField('discount', 'endDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  min={discount.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Discount Preview - FIXED VERSION */}
            {discount.value > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-800 mb-2">
                  Discount Preview
                </p>
                <p className="text-xs text-gray-600">
                  {discount.type === 'percentage' 
                    ? `${discount.value}% off` 
                    : `$${parseFloat(discount.value || 0).toFixed(2)} off`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}