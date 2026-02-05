"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReturnPolicySettings({ returnPolicy, updateNestedField }) {
  const t = useTranslations("products.form");
  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <RotateCcw size={20} className="text-orange-500" />
        {t("fields.returnPolicyTitle")}
      </h3>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={returnPolicy.allowed}
            onChange={(e) => updateNestedField('returnPolicy', 'allowed', e.target.checked)}
            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
          />
          <span className="text-sm font-medium">{t("fields.allowReturns")}</span>
        </label>

        {returnPolicy.allowed && (
          <div className="space-y-4 pl-8 border-l-4 border-orange-200">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("fields.returnWindow")}
              </label>
              <input
                type="number"
                value={returnPolicy.days}
                onChange={(e) => updateNestedField('returnPolicy', 'days', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="30"
                min="0"
                max="365"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("fields.returnWindowDesc")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("fields.returnConditions")}
              </label>
              <textarea
                value={returnPolicy.conditions}
                onChange={(e) => updateNestedField('returnPolicy', 'conditions', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder={t("fields.returnConditionsPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnPolicy.restockingFee}
                  onChange={(e) => updateNestedField('returnPolicy', 'restockingFee', e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium">{t("fields.restockingFee")}</span>
              </label>

              {returnPolicy.restockingFee && (
                <div className="ml-8">
                  <label className="block text-sm font-medium mb-1">
                    {t("fields.restockingFeePercent")}
                  </label>
                  <input
                    type="number"
                    value={returnPolicy.restockingFeePercent || ''}
                    onChange={(e) => updateNestedField('returnPolicy', 'restockingFeePercent', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="15"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t("fields.restockingFeeDesc")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}