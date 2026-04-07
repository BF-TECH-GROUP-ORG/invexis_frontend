"use client";

export default function Step1BasicInfo({ formData, updateFormData }) {
  const handleInputChange = (field, value) => {
    const updates = { [field]: value };

    // Automatically sync Brand and Manufacturer with Supplier Name
    if (field === "supplierName") {
      updates.brand = value;
      updates.manufacturer = value;
    }

    // Automatically sync Tags with Product Name
    if (field === "name") {
      updates.tags = value ? [value] : [];
    }

    updateFormData(updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Basic Product Information
        </h2>
        <p className="text-gray-600 mb-6">
          Enter the essential details about your product
        </p>

        {/* Product Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => updateFormData({ isForSale: true })}
            className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
              formData.isForSale !== false
                ? "border-orange-500 bg-orange-50/50 shadow-md ring-4 ring-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              formData.isForSale !== false ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className={`font-bold text-lg mb-1 ${formData.isForSale !== false ? "text-orange-900" : "text-gray-900"}`}>
              For Sale
            </span>
            <p className={`text-sm ${formData.isForSale !== false ? "text-orange-700" : "text-gray-500"}`}>
              Standard products sold to customers with pricing and tax info.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ isForSale: false })}
            className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
              formData.isForSale === false
                ? "border-orange-500 bg-orange-50/50 shadow-md ring-4 ring-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              formData.isForSale === false ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className={`font-bold text-lg mb-1 ${formData.isForSale === false ? "text-orange-900" : "text-gray-900"}`}>
              Not For Sale
            </span>
            <p className={`text-sm ${formData.isForSale === false ? "text-orange-700" : "text-gray-500"}`}>
              Internal assets, office supplies, or tools not intended for retail.
            </p>
          </button>
        </div>
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter product name"
          required
        />
        {formData.name && formData.name.length < 3 && (
          <p className="text-red-500 text-sm mt-1">
            Name must be at least 3 characters
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Describe your product in detail"
        />
      </div>

      {/* Supplier Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.supplierName}
          onChange={(e) => handleInputChange("supplierName", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter supplier name"
          required
        />
      </div>

      {/* Hidden constant values (handled behind the scenes) */}
      <div className="hidden">
        <input type="hidden" value="new" name="condition" />
        <input type="hidden" value="in_stock" name="availability" />
        <input type="hidden" value="public" name="visibility" />
        <input type="hidden" value="active" name="status" />
        <input type="hidden" value="1" name="sortOrder" />
      </div>
    </div>
  );
}
