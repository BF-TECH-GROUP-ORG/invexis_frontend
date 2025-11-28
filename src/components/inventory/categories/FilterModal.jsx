"use client";

import { useState } from "react";
import { X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

export default function FilterModal({ filters, onApply, onClose }) {
  const { items } = useSelector((state) => state.categories);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({ level: null, parentCategory: null });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-xl w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-2">
              <Filter className="text-orange-500" size={24} />
              <h2 className="text-xl font-bold">Filter Categories</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Level</label>
              <select
                value={localFilters.level || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    level: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Levels</option>
                <option value={1}>Level 1 (Main)</option>
                <option value={2}>Level 2 (Sub)</option>
                <option value={3}>Level 3 (Sub-Sub)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parent Category</label>
              <select
                value={localFilters.parentCategory || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, parentCategory: e.target.value || null })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Parents</option>
                {items
                  .filter((cat) => cat.level < 3)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} (Level {cat.level})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}