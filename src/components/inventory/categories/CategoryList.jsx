"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Filter, Download, Trash2, Lock, RefreshCw, Grid, List, Folder, CheckCircle, XCircle, Search } from "lucide-react";
import { fetchCategories, deleteCategory } from "@/features/categories/categoriesSlice";
import { canManageCategories, hasPermission } from "@/lib/permissions";
import CategoryTable from "./CategoryTable";
import CategoryGrid from "./CategoryGrid";
import AddCategoryModal from "./AddCategoryModal";
import FilterModal from "./FilterModal";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import useAuth from '@/hooks/useAuth';

export default function CategoryList() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, loading, pagination = {}, error, lastFetched } = useSelector((state) => state.categories);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ level: null, parentCategory: null, search: "" });
  const [viewMode, setViewMode] = useState("table");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortByOrder] = useState("asc");

  // Permissions
  const canManage = user ? canManageCategories(user.role) : false;
  const canView = user ? hasPermission(user.role, 'categories', 'view') : false;

  // Safe pagination values (prevents undefined errors)
  const currentPage = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const totalPages = pagination?.pages || 1;

  // Load categories with all current params
  const loadCategories = useCallback((force = false) => {
    if (!canView) return;

    // Only fetch if forced, data doesn't exist, or filters/pagination changed
    // Don't auto-refetch if we already have data
    if (!force && lastFetched && items.length > 0) {
      return; // Skip fetching if we already have cached data
    }

    dispatch(fetchCategories({
      page: currentPage,
      limit,
      search: filters.search || undefined,
      level: filters.level,
      parentCategory: filters.parentCategory,
      sortBy,
      sortOrder,
    }));
  }, [dispatch, canView, currentPage, limit, filters, sortBy, sortOrder, lastFetched, items.length]);

  // Initial load - only fetch if no data exists
  useEffect(() => {
    if (!lastFetched || items.length === 0) {
      loadCategories();
    }
  }, []); // Empty dependency array - only run on mount

  // Refresh handler - force fetch
  const handleRefresh = () => {
    toast.success("Refreshing categories...");
    loadCategories(true); // Force refresh
  };

  // Delete single
  const handleDelete = async (id) => {
    // if (!canManage) return toast.error("Only Super Admins can delete categories!");

    if (!window.confirm("Delete this category? This cannot be undone.")) return;

    try {
      await dispatch(deleteCategory(id)).unwrap();
      toast.success("Category deleted!");
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    // if (!canManage) return toast.error("Only Super Admins can delete categories!");
    if (selectedIds.length === 0) return toast.error("Select categories first");

    if (!window.confirm(`Delete ${selectedIds.length} categories permanently?`)) return;

    try {
      await Promise.all(selectedIds.map(id => dispatch(deleteCategory(id)).unwrap()));
      toast.success(`${selectedIds.length} categories deleted!`);
      setSelectedIds([]);
      loadCategories();
    } catch (err) {
      toast.error("Some categories could not be deleted");
    }
  };

  const handleAddNew = () => {
    // Shop workers (not canManage) are allowed to add Level-3 categories only.
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEdit = (category) => {
    // if (!canManage) return toast.error("Only Super Admins can edit categories!");
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleExport = () => {
    try {
      const csv = [
        ["ID", "Name", "Slug", "Level", "Parent", "Status", "Created"],
        ...items.map(cat => [
          cat._id || "",
          cat.name || "",
          cat.slug || "",
          cat.level || "",
          cat.parentCategory?.name || "-",
          cat.isActive ? "Active" : "Inactive",
          cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : ""
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Exported successfully!");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortByOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortByOrder("asc");
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const clearFilters = () => {
    setFilters({ level: null, parentCategory: null, search: "" });
    toast("Filters cleared");
  };

  // Stats
  const stats = {
    total: items.length,
    active: items.filter(c => c.isActive).length,
    inactive: items.filter(c => !c.isActive).length,
  };

  const activeFiltersCount = [filters.level, filters.parentCategory, filters.search].filter(Boolean).length;

  if (!canView) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Lock className="mx-auto mb-4 text-gray-400" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view categories.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-sm text-red-700">{typeof error === 'string' ? error : error.message}</p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6 mb-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-5 justify-between flex rounded-xl border space-y-3">
            <div className="flex h-full items-center">
              <div className="text-orange-500">
                {key === 'total' && <Folder size={32} strokeWidth={2} />}
                {key === 'active' && <CheckCircle size={32} strokeWidth={2} />}
                {key === 'inactive' && <XCircle size={32} strokeWidth={2} />}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{value}</p>
              <h2 className="">{key.charAt(0).toUpperCase() + key.slice(1)}</h2>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Master Categories</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {items.length} categories
                {activeFiltersCount > 0 && ` • ${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                />
              </div>

              {selectedIds.length > 0 && canManage && (
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-sm">
                  <Trash2 size={18} /> Delete ({selectedIds.length})
                </button>
              )}

              <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 transition shadow-sm text-gray-700">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
              </button>

              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-700">
                <Download size={18} />
              </button>

              <div className="flex border border-gray-300 rounded-full overflow-hidden p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-full transition-all ${viewMode === "table" ? "bg-orange-500 text-white shadow-sm" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-all ${viewMode === "grid" ? "bg-orange-500 text-white shadow-sm" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  <Grid size={18} />
                </button>
              </div>

              {/* Allow shop workers to add Level-3 categories; Super Admins can add any level */}
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition shadow-sm font-medium"
              >
                <Plus size={18} /> {!canManage ? 'Add Category' : 'Add Level 3 Category'}
              </button>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active:</span>
              {filters.level && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Level {filters.level} <button onClick={() => setFilters(f => ({ ...f, level: null }))}>×</button></span>}
              {filters.parentCategory && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Parent Selected <button onClick={() => setFilters(f => ({ ...f, parentCategory: null }))}>×</button></span>}
              {filters.search && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">"{filters.search}" <button onClick={() => setFilters(f => ({ ...f, search: "" }))}>×</button></span>}
              <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium ml-2">Clear all</button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === "table" ? (
            <CategoryTable
              categories={items}
              loading={loading}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onDelete={handleDelete}
              onEdit={handleEdit}
              canManage={canManage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          ) : (
            <CategoryGrid categories={items} loading={loading} onDelete={handleDelete} canManage={canManage} />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.total || 0)} of {pagination.total || 0}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch(fetchCategories({ ...filters, page: currentPage - 1, sortBy, sortOrder }))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages || pageNum < 1) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => dispatch(fetchCategories({ ...filters, page: pageNum, sortBy, sortOrder }))}
                      className={`px-4 py-2 border rounded-lg ${currentPage === pageNum ? "bg-orange-500 text-white" : "hover:bg-gray-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => dispatch(fetchCategories({ ...filters, page: currentPage + 1, sortBy, sortOrder }))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCategoryModal
          editData={editingCategory}
          onClose={() => {
            setShowAddModal(false);
            setEditingCategory(null);
            loadCategories();
          }}
        />
      )}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowFilterModal(false);
            toast.success("Filters applied!");
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}