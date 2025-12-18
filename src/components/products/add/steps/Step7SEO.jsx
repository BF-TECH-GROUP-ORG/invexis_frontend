"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Step7SEO({ formData, updateFormData }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSEOChange = (field, value) => {
    updateFormData({
      seo: {
        ...formData.seo,
        [field]: value,
      },
    });
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value
      .split(",")
      .map((kw) => kw.trim())
      .filter(Boolean);
    handleSEOChange("keywords", keywords);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Auto-generate meta title and slug from product name
  useEffect(() => {
    if (formData.name && !formData.seo.metaTitle) {
      handleSEOChange("metaTitle", formData.name);
    }
    if (formData.name && !formData.seo.slug) {
      handleSEOChange("slug", generateSlug(formData.name));
    }
  }, [formData.name]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          SEO Optimization
        </h2>
        <p className="text-gray-600">
          Optimize your product for search engines and social media
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">
              Configure SEO Settings
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded">
              Optional
            </span>
          </div>

          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="p-6 border-t border-gray-200 space-y-6">
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.seo.metaTitle}
                onChange={(e) => handleSEOChange("metaTitle", e.target.value)}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Product meta title"
              />
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">
                  Perfect length: 50-60 characters
                </span>
                <span
                  className={`${
                    formData.seo.metaTitle.length > 60
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.seo.metaTitle.length}/60
                </span>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  handleSEOChange("metaDescription", e.target.value)
                }
                rows={4}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe your product for search results (150-160 characters recommended)"
              />
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">
                  Perfect length: 150-160 characters
                </span>
                <span
                  className={`${
                    formData.seo.metaDescription.length > 160
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.seo.metaDescription.length}/160
                </span>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={formData.seo.keywords.join(", ")}
                onChange={handleKeywordsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter keywords separated by commas"
              />
              <p className="text-gray-500 text-sm mt-1">
                Example: smartphone, electronics, mobile phone
              </p>
              {formData.seo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.seo.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* URL Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">/products/</span>
                <input
                  type="text"
                  value={formData.seo.slug}
                  onChange={(e) =>
                    handleSEOChange("slug", generateSlug(e.target.value))
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="product-url-slug"
                />
              </div>
              <p className="text-gray-500 text-sm mt-1">
                URL-friendly version of the product name
              </p>
            </div>

            {/* SEO Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Search Engine Preview
              </h3>
              <div className="space-y-2">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.seo.metaTitle || "Product Title Will Appear Here"}
                </div>
                <div className="text-green-700 text-sm">
                  yourdomain.com/products/{formData.seo.slug || "product-slug"}
                </div>
                <div className="text-gray-600 text-sm">
                  {formData.seo.metaDescription ||
                    "Product description will appear here in search results..."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
