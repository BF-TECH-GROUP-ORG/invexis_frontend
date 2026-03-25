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
        <p className="text-gray-600">
          Enter the essential details about your product
        </p>
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
