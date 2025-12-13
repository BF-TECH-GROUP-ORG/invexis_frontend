"use client";

import { Edit2 } from "lucide-react";

export default function ProductReview({ formData, onEdit }) {
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
            onClick={() => onEdit(1)}
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
            <dt className="text-sm text-gray-600">Brand</dt>
            <dd className="font-medium text-gray-900">
              {formData.brand || "N/A"}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-gray-600">Description</dt>
            <dd className="font-medium text-gray-900">
              {formData.description || "No description"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Condition</dt>
            <dd className="font-medium text-gray-900 capitalize">
              {formData.condition}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Status</dt>
            <dd className="font-medium text-gray-900 capitalize">
              {formData.status}
            </dd>
          </div>
          {formData.tags.length > 0 && (
            <div className="col-span-2">
              <dt className="text-sm text-gray-600 mb-2">Tags</dt>
              <dd className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Media */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Images & Media
          </h3>
          <button
            onClick={() => onEdit(2)}
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

      {/* Pricing */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
          <button
            onClick={() => onEdit(3)}
            className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Base Price</dt>
            <dd className="font-medium text-gray-900">
              ${formData.pricing.basePrice.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Sale Price</dt>
            <dd className="font-medium text-gray-900">
              {formData.pricing.salePrice
                ? `$${formData.pricing.salePrice.toFixed(2)}`
                : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Cost Price</dt>
            <dd className="font-medium text-gray-900">
              ${formData.pricing.costPrice.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Currency</dt>
            <dd className="font-medium text-gray-900">
              {formData.pricing.currency}
            </dd>
          </div>
        </dl>
      </div>

      {/* Inventory */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
          <button
            onClick={() => onEdit(4)}
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
              {formData.inventory.quantity} units
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">SKU</dt>
            <dd className="font-medium text-gray-900">
              {formData.inventory.sku || "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Min Stock Level</dt>
            <dd className="font-medium text-gray-900">
              {formData.inventory.minStockLevel}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Max Stock Level</dt>
            <dd className="font-medium text-gray-900">
              {formData.inventory.maxStockLevel}
            </dd>
          </div>
        </dl>
      </div>

      {/* Category */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Category</h3>
          <button
            onClick={() => onEdit(5)}
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
              {formData.categoryName}
            </dd>
          </div>
          {formData.parentCategoryName && (
            <div>
              <dt className="text-sm text-gray-600">Parent Category</dt>
              <dd className="font-medium text-gray-900">
                {formData.parentCategoryName}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Specifications */}
      {Object.keys(formData.specs).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Specifications
            </h3>
            <button
              onClick={() => onEdit(6)}
              className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {Object.entries(formData.specs).map(([key, value]) => (
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

      {/* SEO */}
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
    </div>
  );
}
