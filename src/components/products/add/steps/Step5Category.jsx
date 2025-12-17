"use client";

import { useState, useEffect } from "react";
import { getCategories, ParentCategories } from "@/services/categoriesService";
import { Search } from "lucide-react";

export default function Step5Category({ formData, updateFormData }) {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories({ companyId: [formData.companyId] });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await ParentCategories(formData.companyId);
      setParentCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const handleCategorySelect = (category) => {
    // Find parent category name (Level 2) for specs lookup
    // const parentCategory = parentCategories.find(
    //   (p) => p._id === category.parentCategory
    // );

    const parentCategory = category.parentCategory || null;


    updateFormData({
      categoryId: category._id,
      categoryName: category.name,
      parentCategoryName: parentCategory?.name || "",
    });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select Product Category
        </h2>
        <p className="text-gray-600">
          Choose the category that best describes your product
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Selected Category Display */}
      {formData.categoryId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected Category:</p>
              <p className="font-semibold text-gray-900">
                {formData.categoryName}
              </p>
              {formData.parentCategoryName && (
                <p className="text-sm text-gray-600 mt-1">
                  Parent: {formData.parentCategoryName}
                </p>
              )}
            </div>
            <button
              onClick={() =>
                updateFormData({
                  categoryId: "",
                  categoryName: "",
                  parentCategoryName: "",
                })
              }
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No categories found
          </div>
        ) : (
          filteredCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategorySelect(category)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.categoryId === category._id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              <div className="font-medium text-gray-900">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {category.description}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {!formData.categoryId && (
        <p className="text-red-500 text-sm">
          Please select a category to continue
        </p>
      )}
    </div>
  );
}
