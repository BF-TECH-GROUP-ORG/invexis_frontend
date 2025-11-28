"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { MoreVertical, Edit, Trash2, Folder } from "lucide-react";
import { toggleCategoryActive } from "@/features/categories/categoriesSlice";
import { toast } from "react-hot-toast";

export default function CategoryTable({
  categories,
  loading,
  selectedIds,
  onSelectIds,
  onDelete,
  onEdit,
  canManage = false
}) {
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectIds(categories.map(cat => cat._id));
    } else {
      onSelectIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await dispatch(toggleCategoryActive(id));
      toast.success("Category status updated!");
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Folder className="mx-auto mb-4 text-gray-400" size={64} />
        <p className="text-lg">No categories found</p>
        <p className="text-sm mt-2">Create categories to get started</p>
      </div>
    );
  }

  return (
    <div className="">
      <table className="w-full">
        <thead className="border-b bg-gray-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="pb-3 px-4">
              <input
                type="checkbox"
                checked={selectedIds.length === categories.length && categories.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
            </th>
            <th className="pb-3 px-4">Category Name</th>
            <th className="pb-3 px-4">Level</th>
            <th className="pb-3 px-4">Parent</th>
            <th className="pb-3 px-4">Status</th>
            <th className="pb-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id} className="border-b hover:bg-gray-50 transition">
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(category._id)}
                  onChange={() => handleSelectOne(category._id)}
                  className="rounded"
                />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Folder size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  Level {category.level}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {category.parentCategory?.name || "-"}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleToggleActive(category._id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${category.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    } hover:opacity-80`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="py-3 px-4 relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === category._id ? null : category._id)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <MoreVertical size={18} />
                </button>
                {menuOpen === category._id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setMenuOpen(null);
                        if (onEdit) onEdit(category);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left transition"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(null);
                        onDelete(category._id);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600 text-left transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}