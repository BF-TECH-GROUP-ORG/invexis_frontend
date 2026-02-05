"use client";
import { useSession } from "next-auth/react";
import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Plus, Download, Trash2, RefreshCw, Grid, List, Folder, CheckCircle, XCircle, Search } from "lucide-react";
import { deleteCategory } from "@/features/categories/categoriesSlice";
import { canManageCategories, hasPermission } from "@/lib/permissions";
import CategoryTable from "./CategoryTable";
import CategoryGrid from "./CategoryGrid";
import AddCategoryModal from "./AddCategoryModal";
import FilterModal from "./FilterModal";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import useAuth from '@/hooks/useAuth';
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/services/categoriesService";

export default function CategoryList() {
  const t = useTranslations("categories");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ level: null, parentCategory: null, search: "" });
  const [viewMode, setViewMode] = useState("table");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortByOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Permissions
  const canManage = user ? canManageCategories(user.role) : false;
  const canView = user ? hasPermission(user.role, 'categories', 'view') : false;

  const fetchParams = useMemo(() => ({
    page: currentPage,
    limit,
    search: filters.search || undefined,
    level: filters.level,
    parentCategory: filters.parentCategory,
    sortBy,
    sortOrder,
    companyId
  }), [currentPage, limit, filters, sortBy, sortOrder, companyId]);

  const options = useMemo(() => (session?.accessToken ? {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  } : {}), [session?.accessToken]);

  const { data: categoriesResponse, isLoading: loading, error } = useQuery({
    queryKey: ["categories", fetchParams],
    queryFn: () => getCategories(fetchParams, options),
    enabled: canView && !!companyId && !!session?.accessToken,
    staleTime: 60000,
  });

  const items = useMemo(() => categoriesResponse?.data || categoriesResponse || [], [categoriesResponse]);
  const pagination = useMemo(() => categoriesResponse?.pagination || { page: 1, limit: 20, total: items.length, pages: 1 }, [categoriesResponse, items.length]);
  const totalPages = pagination?.pages || 1;

  // Refresh handler
  const handleRefresh = () => {
    toast.success(t("toasts.refreshing"));
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // Delete single
  const handleDelete = async (id) => {
    if (!window.confirm(t("toasts.deleteConfirm"))) return;
    try {
      await dispatch(deleteCategory(id)).unwrap();
      toast.success(t("toasts.deleteSuccess"));
      setSelectedIds(prev => prev.filter(sid => sid !== id));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return toast.error("Select categories first");
    if (!window.confirm(t("toasts.bulkDeleteConfirm", { count: selectedIds.length }))) return;
    try {
      await Promise.all(selectedIds.map(id => dispatch(deleteCategory(id)).unwrap()));
      toast.success(t("toasts.bulkDeleteSuccess", { count: selectedIds.length }));
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      toast.error("Some categories could not be deleted");
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEdit = (category) => {
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

      toast.success(t("toasts.exportSuccess"));
    } catch (err) {
      toast.error(t("toasts.exportFailed"));
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
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ level: null, parentCategory: null, search: "" });
    setCurrentPage(1);
    toast(t("toasts.filtersCleared"));
  };

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(c => c.isActive).length,
    inactive: items.filter(c => !c.isActive).length,
  }), [items]);

  const activeFiltersCount = [filters.level, filters.parentCategory, filters.search].filter(Boolean).length;

  return (
    <div className="md:p-6 bg-white min-h-screen">
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-sm text-red-700">{typeof error === 'string' ? error : error.message}</p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6 mb-6 p-4 md:p-0">
        {Object.entries(stats).map(([key, value]) => {
          const config = {
            total: { icon: Folder, color: "#ff782d", bgColor: "#fff8f5", label: t("list.totalCategories") },
            active: { icon: CheckCircle, color: "#10b981", bgColor: "#f0fdf4", label: t("list.activeCategories") },
            inactive: { icon: XCircle, color: "#ef4444", bgColor: "#fff1f2", label: t("list.inactiveCategories") },
          }[key] || { icon: Folder, color: "#6b7280", bgColor: "#f9fafb", label: key };

          const Icon = config.icon;

          return (
            <div
              key={key}
              className="border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#6b7280] font-medium mb-1">{config.label}</p>
                  <p className="text-2xl font-bold text-[#081422] mb-2">{value}</p>
                </div>
                <div
                  className="p-3 rounded-xl shrink-0"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <Icon size={24} style={{ color: config.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-300 mx-2 md:mx-0">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{t("list.title")}</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t("list.categoriesCount", { count: items.length })}
                {activeFiltersCount > 0 && ` • ${t("list.activeFilters", { count: activeFiltersCount })}`}
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
                  placeholder={t("list.searchPlaceholder")}
                  className="w-full sm:w-[312px] pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                />
              </div>

              {selectedIds.length > 0 && canManage && (
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
                  <Trash2 size={18} /> {t("list.deleteSelected", { count: selectedIds.length })}
                </button>
              )}

              <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 transition text-gray-700">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> {t("list.refresh")}
              </button>

              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition text-gray-700">
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
                  className={`p-2 rounded-full transition-all ${viewMode === "grid" ? "bg-orange-500 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  <Grid size={18} />
                </button>
              </div>

              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-3 bg-[#081422] text-white rounded-xl hover:bg-orange-600 transition font-medium"
              >
                <Plus size={24} /> {!canManage ? t('list.addCategory') : t('list.addLevel3')}
              </button>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active:</span>
              {filters.level && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">{t("table.levelLabel", { level: filters.level })} <button onClick={() => setFilters(f => ({ ...f, level: null }))}>×</button></span>}
              {filters.parentCategory && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Parent Selected <button onClick={() => setFilters(f => ({ ...f, parentCategory: null }))}>×</button></span>}
              {filters.search && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">"{filters.search}" <button onClick={() => setFilters(f => ({ ...f, search: "" }))}>×</button></span>}
              <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium ml-2">{t("list.clearAll")}</button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-0 md:p-6">
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
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg ${currentPage === pageNum ? "bg-orange-500 text-white" : "hover:bg-gray-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            queryClient.invalidateQueries({ queryKey: ["categories"] });
          }}
        />
      )}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowFilterModal(false);
            setCurrentPage(1);
            toast.success(t("toasts.filtersApplied"));
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}