"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createCategory,
  updateCategory,
} from "@/features/categories/categoriesSlice";
import { ParentCategories } from "@/services/categoriesService";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";

export default function AddCategoryModal({ onClose, editData = null }) {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.categories);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAttributes, setShowAttributes] = useState(
    editData?.attributes?.length > 0
  );

  const [formData, setFormData] = useState({
    name: editData?.name || "",
    companyId: user?.companies[0] || editData?.companyId || "",
    parentCategory:
      editData?.parentCategory?._id || editData?.parentCategory || "",
    description: editData?.description || "",
    attributes: editData?.attributes || [],
  });

  const [newAttribute, setNewAttribute] = useState({
    name: "",
    type: "text",
    required: false,
    options: [],
  });
  const [optionInput, setOptionInput] = useState("");

  // Get parent category options
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        let currentCompanyId = editData?.companyId;

        if (!currentCompanyId && user) {
          // Try user.company
          if (user.company) {
            currentCompanyId =
              typeof user.company === "string"
                ? user.company
                : user.company._id || user.company.id;
          }
          // Try user.companies array if still not found
          if (
            !currentCompanyId &&
            user.companies &&
            Array.isArray(user.companies) &&
            user.companies.length > 0
          ) {
            const companyObj = user.companies[0];
            currentCompanyId =
              typeof companyObj === "string"
                ? companyObj
                : companyObj._id || companyObj.id;
          }
        }

        console.log(
          "Fetching parents for company:",
          currentCompanyId,
          "User object:",
          user
        );

        if (currentCompanyId) {
          const data = await ParentCategories(currentCompanyId);
          // Handle if data is array or { data: array }
          const parents = Array.isArray(data) ? data : data.data || [];
          setParentOptions(parents.filter((cat) => cat._id !== editData?._id));
        } else {
          console.log("No company ID found in user object or editData");
        }
      } catch (error) {
        console.error("Error fetching parent categories:", error);
        // toast.error("Failed to load parent categories");
      }
    };
    fetchParents();
  }, [editData?._id, user?.company?._id]);

  const addOption = () => {
    if (
      optionInput.trim() &&
      !newAttribute.options.includes(optionInput.trim())
    ) {
      setNewAttribute({
        ...newAttribute,
        options: [...newAttribute.options, optionInput.trim()],
      });
      setOptionInput("");
    }
  };

  const removeOption = (index) => {
    setNewAttribute({
      ...newAttribute,
      options: newAttribute.options.filter((_, i) => i !== index),
    });
  };

  const addAttribute = () => {
    if (newAttribute.name.trim()) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, { ...newAttribute }],
      });
      setNewAttribute({ name: "", type: "text", required: false, options: [] });
    }
  };

  const removeAttribute = (index) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        companyId: formData.companyId || undefined,
        parentCategory: formData.parentCategory || undefined,
      };

      if (editData) {
        await dispatch(
          updateCategory({ id: editData._id, updates: payload })
        ).unwrap();
        toast.success("Category updated successfully! ✨");
      } else {
        await dispatch(createCategory(payload)).unwrap();
        toast.success("Category created successfully! 🎉");
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white text-gray-700 px-6 py-4 flex items-center justify-between border-b-2 rounded-t-2xl">
            <h2 className="text-2xl font-bold">
              {editData ? "Edit Category" : "Add New Category"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="e.g., Men's Casual Shirts"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Parent Category
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, parentCategory: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition"
                >
                  <option value="">Select Section</option>
                  {parentOptions.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition resize-none"
                placeholder="Brief description of the category..."
              />
            </div>

            {/* Collapsible Attributes Section */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAttributes(!showAttributes)}
                className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition flex items-center justify-between"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-orange-500 rounded-full"></span>
                  Product Attributes{" "}
                  {formData.attributes.length > 0 &&
                    `(${formData.attributes.length})`}
                </h3>
                <motion.div
                  animate={{ rotate: showAttributes ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} className="text-gray-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showAttributes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 bg-gradient-to-br from-orange-50 to-white border-t-2">
                      <div className="space-y-3 mb-4">
                        <input
                          type="text"
                          placeholder="Attribute name (e.g., Size)"
                          value={newAttribute.name}
                          onChange={(e) =>
                            setNewAttribute({
                              ...newAttribute,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={newAttribute.type}
                            onChange={(e) =>
                              setNewAttribute({
                                ...newAttribute,
                                type: e.target.value,
                              })
                            }
                            className="px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 transition"
                          >
                            <option value="text">Text</option>
                            <option value="select">Select</option>
                            <option value="number">Number</option>
                          </select>
                          <label className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg bg-white cursor-pointer hover:border-orange-300 transition">
                            <input
                              type="checkbox"
                              checked={newAttribute.required}
                              onChange={(e) =>
                                setNewAttribute({
                                  ...newAttribute,
                                  required: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium">
                              Required
                            </span>
                          </label>
                        </div>

                        {newAttribute.type === "select" && (
                          <div className="bg-white p-3 rounded-lg border-2">
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Add option (e.g., S, M, L)"
                                value={optionInput}
                                onChange={(e) => setOptionInput(e.target.value)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), addOption())
                                }
                                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              />
                              <button
                                type="button"
                                onClick={addOption}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            {newAttribute.options.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {newAttribute.options.map((opt, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2"
                                  >
                                    {opt}
                                    <button
                                      type="button"
                                      onClick={() => removeOption(idx)}
                                      className="hover:text-orange-900"
                                    >
                                      <X size={14} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={addAttribute}
                          disabled={!newAttribute.name.trim()}
                          className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                        >
                          Add Attribute
                        </button>
                      </div>

                      {/* Display Added Attributes */}
                      {formData.attributes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Added Attributes:
                          </p>
                          {formData.attributes.map((attr, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border-2 hover:border-orange-300 transition"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">
                                  {attr.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Type: {attr.type}{" "}
                                  {attr.required && "• Required"}
                                  {attr.options?.length > 0 &&
                                    ` • ${attr.options.join(", ")}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttribute(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition font-medium shadow-lg"
              >
                {loading
                  ? "Saving..."
                  : editData
                  ? "Update Category"
                  : "Create Category"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
