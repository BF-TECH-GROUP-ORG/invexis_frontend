"use client";

import { motion } from "framer-motion";
import { Folder, MoreVertical, Edit, Trash2, Eye, Package } from "lucide-react";
import { useState } from "react";

export default function CategoryGrid({ categories, loading, onDelete, canManage }) {
  const [menuOpen, setMenuOpen] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="mx-auto mb-4 text-gray-400" size={64} />
        <p className="text-lg text-gray-500">No categories found</p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return "bg-blue-100 text-blue-700 border-blue-200";
      case 2: return "bg-green-100 text-green-700 border-green-200";
      case 3: return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-orange-300 transition-all p-5 relative group"
        >
          {/* Category Image/Icon */}
          <div className="mb-4">
            {category.image?.url ? (
              <img
                src={category.image.url}
                alt={category.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-32 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <Folder size={48} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Category Info */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(category.level)}`}>
              Level {category.level}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              category.isActive 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Package size={16} />
              <span>{category.statistics?.totalProducts || 0} products</span>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-3 right-3">
            <button
              onClick={() => setMenuOpen(menuOpen === category._id ? null : category._id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen === category._id && (
              <div className="absolute right-0 mt-2 w-40 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10">
                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left transition text-sm">
                  <Eye size={16} /> View
                </button>
                {canManage && (
                  <>
                    <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left transition text-sm">
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(null);
                        onDelete(category._id);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600 text-left transition text-sm"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}