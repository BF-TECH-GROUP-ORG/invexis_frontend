"use client";

import { useEffect, useState, useMemo } from "react";
import { PRODUCT_SPECS } from "@/lib/productSpecs";
import DynamicSpecField from "../shared/DynamicSpecField";
import { getCategoryWithParent } from "@/services/categoriesService";
import { Loader2, ChevronDown } from "lucide-react";

export default function Step6Specs({ formData, updateFormData }) {
  const [loading, setLoading] = useState(false);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [openSections, setOpenSections] = useState({
    advanced: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch hierarchy when categoryId changes
  useEffect(() => {
    const fetchHierarchy = async () => {
      if (!formData.category.id) return;

      setLoading(true);
      try {
        const response = await getCategoryWithParent(formData.category.id);
        const data = response.data || response;
        setHierarchyData(data);

        let targetCategoryName = null;
        if (data.level2Parent) {
          targetCategoryName = data.level2Parent.name;
        } else if (data.level1GrandParent) {
          targetCategoryName = data.level1GrandParent.name;
        }

        if (
          targetCategoryName &&
          targetCategoryName !== formData.specsCategory
        ) {
          updateFormData({ specsCategory: targetCategoryName });
        }
      } catch (error) {
        console.error("Failed to fetch category hierarchy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [formData.category.id]);

  // Find the specs configuration based on parent category name
  const specsConfig = useMemo(() => {
    if (!formData.specsCategory) return null;

    return PRODUCT_SPECS.find(
      (spec) => spec.categoryName === formData.specsCategory
    );
  }, [formData.specsCategory]);

  const handleSpecChange = (key, value) => {
    updateFormData({
      specifications: {
        ...formData.specifications,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading category specifications...</p>
      </div>
    );
  }

  // If no category selected or no specs config found
  if (!formData.category.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <svg
          className="w-20 h-20 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Category Selected
        </h3>
        <p className="text-gray-600">
          Please select a category in the previous step to see specification
          fields
        </p>
      </div>
    );
  }

  if (!specsConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <svg
          className="w-20 h-20 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Specifications Required
        </h3>
        <p className="text-gray-600">
          This category ({formData.specsCategory || "Unknown"}) does not have
          specific specifications to fill
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Product Specifications
        </h2>
        <p className="text-gray-600">
          Enter detailed specifications for{" "}
          <span className="font-semibold">{formData.specsCategory}</span>
        </p>
      </div>

      {/* Basic Specifications */}
      {specsConfig.basicSpecs && specsConfig.basicSpecs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-orange-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            Basic Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specsConfig.basicSpecs.map((spec) => (
              <DynamicSpecField
                key={spec.key}
                spec={{ ...spec, required: true }}
                value={formData.specifications[spec.key]}
                onChange={handleSpecChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Advanced Specifications */}
      {specsConfig.advancedSpecs && specsConfig.advancedSpecs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("advanced")}
            className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Advanced Specifications
            </h3>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                openSections.advanced ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {openSections.advanced && (
            <div className="p-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {specsConfig.advancedSpecs.map((spec) => (
                <DynamicSpecField
                  key={spec.key}
                  spec={spec}
                  value={formData.specifications[spec.key]}
                  onChange={handleSpecChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Specs Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">
          Specifications Summary
        </h4>
        <p className="text-sm text-gray-600">
          {Object.keys(formData.specifications).length} specification
          {Object.keys(formData.specifications).length !== 1 ? "s" : ""} added
        </p>
      </div>
    </div>
  );
}
