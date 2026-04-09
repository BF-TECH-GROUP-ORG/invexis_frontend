"use client";

import { Edit2 } from "lucide-react";

export default function ProductReview({ formData, onEdit, steps }) {
  const formatSpecLabel = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatSpecValue = (value) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value?.toString() || "N/A";
  };

  const getStepNumber = (id) => {
    return steps.find((s) => s.id === id)?.number || 1;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Product Details
        </h2>
        <p className="text-gray-600">
          Review all the information before submitting. Click Edit to make
          changes to any section.
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h3>
          <button
            onClick={() => onEdit(getStepNumber("basic"))}
            className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Product Name</dt>
            <dd className="font-medium text-gray-900">{formData.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Supplier Name</dt>
            <dd className="font-medium text-gray-900">
              {formData.supplierName || "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Product Purpose</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                formData.isForSale !== false
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {formData.isForSale !== false ? "For Sale" : "Internal Use / Not For Sale"}
              </span>
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-gray-600">Description</dt>
            <dd className="font-medium text-gray-900">
              {formData.description || "No description"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Media */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Images & Media
          </h3>
          <button
            onClick={() => onEdit(getStepNumber("media"))}
            className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Product Images ({formData.images.length})
          </p>
          <div className="grid grid-cols-6 gap-2">
            {formData.images.slice(0, 6).map((image, idx) => (
              <img
                key={idx}
                src={image.url}
                alt={`Product ${idx + 1}`}
                className="w-full h-20 object-cover rounded border"
              />
            ))}
          </div>
          {formData.videoUrls.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Video URLs: {formData.videoUrls.length}
            </p>
          )}
        </div>
      </div>

      {/* Pricing - Only show if for sale */}
      {formData.isForSale !== false && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
            <button
              onClick={() => onEdit(getStepNumber("pricing"))}
              className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-600">Cost Price</dt>
              <dd className="font-medium text-gray-900">
                {formData.pricing.cost?.toLocaleString() || "0"} RWF
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Selling Price</dt>
              <dd className="font-medium text-gray-900">
                {formData.pricing.basePrice?.toLocaleString() || "0"} RWF
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Inventory */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
          <button
            onClick={() => onEdit(getStepNumber("inventory"))}
            className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Current Quantity</dt>
            <dd className="font-medium text-gray-900">
              {formData.inventory.stockQty} units
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Low Stock Threshold</dt>
            <dd className="font-medium text-gray-900">
              {formData.inventory.lowStockThreshold}
            </dd>
          </div>
        </dl>
      </div>

      {/* Category */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Category</h3>
          <button
            onClick={() => onEdit(getStepNumber("category"))}
            className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Selected Category</dt>
            <dd className="font-medium text-gray-900">
              {formData.category.name || "N/A"}
            </dd>
          </div>
          {formData.specsCategory && (
            <div>
              <dt className="text-sm text-gray-600">Specs Category</dt>
              <dd className="font-medium text-gray-900">
                {formData.specsCategory}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Specifications */}
      {Object.keys(formData.specifications || {}).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Specifications
            </h3>
            <button
              onClick={() => onEdit(getStepNumber("specs"))}
              className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm text-gray-600">
                  {formatSpecLabel(key)}
                </dt>
                <dd className="font-medium text-gray-900">
                  {formatSpecValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Variations (Hidden as requested) */}
      {/* 
      {(formData.variants?.length > 0 || formData.variations?.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
            <button
              onClick={() =>
                onEdit(steps.find((s) => s.id === "variations")?.number || 7)
              }
              className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <div className="space-y-4">
            {formData.variants?.length > 0 && (
              <div>
                <dt className="text-sm text-gray-600 mb-2">Attributes</dt>
                <dd className="flex flex-wrap gap-4">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded border">
                      <span className="font-bold text-xs uppercase text-gray-500 block">
                        {v.name}
                      </span>
                      <span className="text-sm">{v.options.join(", ")}</span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
            {formData.variations?.length > 0 && (
              <div>
                <dt className="text-sm text-gray-600 mb-2">
                  Generated Combinations ({formData.variations.length})
                </dt>
                <div className="max-h-60 overflow-y-auto border rounded divide-y">
                  {formData.variations.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-2 text-sm flex justify-between items-center bg-white"
                    >
                      <span className="font-medium">
                        {Object.entries(v.options || {})
                          .map(([key, val]) => `${key}: ${val}`)
                          .join(", ")}
                      </span>
                      <span className="text-gray-500">
                        Stock: {v.initialStock || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      */}

      {/* SEO (Hidden as requested) */}
      {/* 
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SEO</h3>
          <button
            onClick={() => onEdit(7)}
            className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-600">Meta Title</dt>
            <dd className="font-medium text-gray-900">
              {formData.seo.metaTitle}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">URL Slug</dt>
            <dd className="font-medium text-gray-900">
              /products/{formData.seo.slug}
            </dd>
          </div>
          {formData.seo.metaDescription && (
            <div>
              <dt className="text-sm text-gray-600">Meta Description</dt>
              <dd className="font-medium text-gray-900">
                {formData.seo.metaDescription}
              </dd>
            </div>
          )}
        </dl>
      </div>
      */}
    </div>
  );
}
