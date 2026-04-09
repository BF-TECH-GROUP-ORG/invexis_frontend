"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Filter, Search, RefreshCw, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";

import { getCategories } from "@/services/categoriesService";
import { getCompanyAssets } from "@/services/organizationService";
import { deleteProduct } from "@/features/products/productsSlice";
import apiClient from "@/lib/apiClient";

import MaterialStockTable from "./MaterialStockTable";
import MaterialStockStats from "./MaterialStockStats";
import ConfirmModal from "@/components/shared/ConfirmModal";

/**
 * MaterialStockList - Container for non-saleable items (Internal Assets/Supplies)
 */
export default function MaterialStockList({ initialParams = {} }) {
  const t = useTranslations();
  const tm = useTranslations("materials");
  const tf = useTranslations("form");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Sync state with URL params
  const currentPage = parseInt(searchParams.get("page")) || initialParams.page || 1;
  const limit = parseInt(searchParams.get("limit")) || initialParams.limit || 20;
  const searchTermFromUrl = searchParams.get("search") || initialParams.search || "";
  const currentCategory = searchParams.get("category") || initialParams.category || "";

  const [searchTerm, setSearchTerm] = useState(searchTermFromUrl);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const filterRef = useRef(null);

  const currentUser = useMemo(() => session?.user || initialParams?.user, [session?.user, initialParams?.user]);
  const companyId = currentUser?.companies?.[0] || initialParams?.companyId;
  const accessToken = session?.accessToken || initialParams?.accessToken;

  const options = useMemo(() => (accessToken ? {
    headers: { Authorization: `Bearer ${accessToken}` }
  } : {}), [accessToken]);

  // Update URL filters
  const updateFilters = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });
    if (!updates.page) params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Debounced search
  useEffect(() => {
    if (searchTerm === searchTermFromUrl) return;
    const timer = setTimeout(() => updateFilters({ search: searchTerm }), 600);
    return () => clearTimeout(timer);
  }, [searchTerm, searchTermFromUrl, updateFilters]);

  // Data Fetching - FORCE isForSale: false
  const fetchParams = useMemo(() => ({
    page: currentPage,
    limit,
    search: searchTermFromUrl || undefined,
    category: currentCategory || undefined,
    companyId,
    isForSale: "false", // Critical: Fetch only non-saleable items
  }), [currentPage, limit, searchTermFromUrl, currentCategory, companyId]);

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["materials", fetchParams],
    queryFn: () => getCompanyAssets(companyId, fetchParams),
    enabled: !!companyId && !!accessToken,
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", { companyId }],
    queryFn: () => getCategories({ companyId }, options),
    enabled: !!companyId && !!accessToken,
  });

  const products = useMemo(() => {
    const rawItems = productsResponse?.data || productsResponse || [];
    return Array.isArray(rawItems) ? rawItems.filter(p => !p.isDeleted) : [];
  }, [productsResponse]);

  const categories = useMemo(() => Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [], [categoriesResponse]);
  const pagination = useMemo(() => productsResponse?.pagination || { page: 1, pages: 1 }, [productsResponse]);

  // Handlers
  const handleDeleteRequest = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(deleteModal.id)).unwrap();
      toast.success("Material deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setDeleteModal({ isOpen: false, id: null });
    } catch {
      toast.error("Failed to delete material");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    apiClient.clearCache();
    queryClient.invalidateQueries({ queryKey: ["materials"] });
    toast.success("Records refreshed");
  };

  // Stats calculation
  const stats = useMemo(() => ({
    total: pagination.total || products.length,
    inStock: products.filter(p => (p.stock?.total || p.shopInventory?.quantity || 0) > 0).length,
    lowStock: products.filter(p => {
      const qty = p.stock?.total || p.shopInventory?.quantity || 0;
      const threshold = p.stock?.lowStockThreshold || p.shopInventory?.lowStockThreshold || 10;
      return qty > 0 && qty <= threshold;
    }).length,
    totalValue: products.reduce((sum, p) => sum + (p.pricing?.cost || 0) * (p.stock?.total || p.shopInventory?.quantity || 0), 0),
  }), [products, pagination.total]);

  const productPath = "/inventory/products";
  const routes = {
    add: `${productPath}/add-wizard?type=material`,
    view: (id) => `/inventory/material-stock/${id}`,
    edit: (id) => `${productPath}/${id}/edit?type=material`,
  };

  return (
    <div className="space-y-6">
      <MaterialStockStats stats={stats} isMounted={isMounted} />

      <div className="bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#081422] flex items-center gap-2">
              <Layers className="text-[#081422]" />
              {tm("reports.title")}
            </h1>
            <p className="text-sm text-gray-400 font-medium">{tm("reports.subtitle")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={tf("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm bg-gray-50/50 font-bold"
              />
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full transition font-bold text-sm ${currentCategory ? "border-black text-black bg-gray-50" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
              >
                <Filter size={16} /> {tm("reports.advancedFilters")}
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 p-4 z-20 shadow-xl">
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{tm("reports.category") || "Category"}</label>
                   <select
                     value={currentCategory}
                     onChange={(e) => { updateFilters({ category: e.target.value }); setIsFilterOpen(false); }}
                     className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                   >
                     <option value="">{tm("reports.allCategories") || "All Categories"}</option>
                     {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                   </select>
                </div>
              )}
            </div>

            <button onClick={handleRefresh} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-400"><RefreshCw size={18} /></button>

            <Link href={routes.add} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#081422] text-white rounded-xl hover:bg-black transition font-bold shadow-lg shadow-gray-200">
              <Plus size={20} /> {tf("add")} Material
            </Link>
          </div>
        </div>

        <MaterialStockTable
          products={products}
          loading={productsLoading}
          onDelete={handleDeleteRequest}
          viewUrl={routes.view}
          editUrl={routes.edit}
          pagination={pagination}
          onPageChange={(p) => updateFilters({ page: p })}
        />
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={tm("deleteConfirm.title") || "Delete Asset?"}
        message={tm("deleteConfirm.message") || "Are you sure you want to delete this material asset? This action cannot be undone."}
        confirmText={tm("deleteConfirm.confirm") || "Delete Asset"}
      />
    </div>
  );
}
