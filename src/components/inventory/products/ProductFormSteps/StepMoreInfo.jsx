// src/components/inventory/products/ProductFormSteps/StepMoreInfo.jsx
"use client";

import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

export default function StepMoreInfo({ formData, updateFormData }) {
  const attributes = formData.attributes || [];

  const handleAddAttribute = () => {
    updateFormData({ attributes: [...attributes, { name: "", value: "" }] });
  };

  const handleRemoveAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    updateFormData({ attributes: newAttributes });
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    updateFormData({ attributes: newAttributes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Product Attributes</h3>
        <p className="text-sm text-gray-500 mb-6">
          Add custom attributes like Material, Care Instructions, etc.
        </p>

        {attributes.map((attr, index) => (
          <div key={index} className="flex gap-4 mb-4 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={attr.name}
                onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Name (e.g. Material)"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={attr.value}
                onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Value (e.g. 100% Cotton)"
              />
            </div>
            <button
              onClick={() => handleRemoveAttribute(index)}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddAttribute}
          className="flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 mt-2"
        >
          <Plus size={20} />
          Add Attribute
        </button>
      </div>
    </motion.div>
  );
}
