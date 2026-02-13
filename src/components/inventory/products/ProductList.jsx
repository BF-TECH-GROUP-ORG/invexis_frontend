"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  Plus,
  Filter,
  Download,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useSession } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import {
  deleteProduct,
} from "@/features/products/productsSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/services/productsService";
import { getCategories } from "@/services/categoriesService";
import { fetchWarehouses } from "@/features/warehouses/warehousesSlice";
import { useSelector } from "react-redux";
import ProductTable from "./ProductTable";
import ProductStats from "./ProductStats";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function ProductList({ initialParams = {} }) {
  const t = useTranslations("products");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();

  const {
    page: initialPage = 1,
    limit: initialLimit = 20,
    search: initialSearch = "",
    category: initialCategory = "",
    warehouse: initialWarehouse = "",
    status: initialStatus = "",
    companyId: initialCompanyId
  } = initialParams;

  // Sync state with URL params
  const currentPage = parseInt(searchParams.get("page")) || initialPage;
  const limit = parseInt(searchParams.get("limit")) || initialLimit;
  const searchTermFromUrl = searchParams.get("search") || initialSearch;
  const currentCategory = searchParams.get("category") || initialCategory;
  const currentWarehouse = searchParams.get("warehouse") || initialWarehouse;
  const currentStatus = searchParams.get("status") || initialStatus;

  const [searchTerm, setSearchTerm] = useState(searchTermFromUrl);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Sync internal search field with URL if URL changes externally
  useEffect(() => {
    setSearchTerm(searchTermFromUrl);
  }, [searchTermFromUrl]);

  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id || initialCompanyId;

  const warehousesState = useSelector((state) => state.warehouses || {});
  const warehouses = Array.isArray(warehousesState.items) ? warehousesState.items : [];

  const basePath = pathname?.replace(/\/$/, "") || "/inventory/products";

  const routes = {
    add: `${basePath}/add-wizard`,
    view: (id) => `${basePath}/${id}`,
    edit: (id) => `${basePath}/${id}/edit`,
  };

  const options = useMemo(() => (session?.accessToken ? {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  } : {}), [session?.accessToken]);

  // Helper to update filters in URL
  const updateFilters = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 for any search/filter changes unless explicitly a page change
    if (!updates.page) {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Debounce search term update to URL
  useEffect(() => {
    if (searchTerm === searchTermFromUrl) return;
    const timer = setTimeout(() => {
      updateFilters({ search: searchTerm });
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm, searchTermFromUrl, updateFilters]);

  const fetchParams = useMemo(() => ({
    page: currentPage,
    limit,
    search: searchTermFromUrl || undefined,
    category: currentCategory || undefined,
    warehouse: currentWarehouse || undefined,
    status: currentStatus || undefined,
    companyId,
  }), [currentPage, limit, searchTermFromUrl, currentCategory, currentWarehouse, currentStatus, companyId]);

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", fetchParams],
    queryFn: () => getProducts(fetchParams, options),
    enabled: !!companyId && !!session?.accessToken,
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", { companyId }],
    queryFn: () => getCategories({ companyId }, options),
    enabled: !!companyId && !!session?.accessToken,
  });

  const allProducts = useMemo(() => {
    const rawItems = productsResponse?.data || productsResponse || [];
    return Array.isArray(rawItems) ? rawItems.filter(
      (item) =>
        !item.isDeleted &&
        (!item.status ||
          typeof item.status !== "object" ||
          !item.status.isDeleted)
    ) : [];
  }, [productsResponse]);

  const products = useMemo(() => {
    const userRole = session?.user?.role;
    const assignedDepartments = session?.user?.assignedDepartments || [];
    const isSalesWorker = assignedDepartments.includes("sales") && userRole !== "company_admin";
    const userShopId = session?.user?.shops?.[0];

    if (isSalesWorker && userShopId) {
      return allProducts.filter(p => p.shopId === userShopId);
    }
    return allProducts;
  }, [allProducts, session?.user]);

  const categories = useMemo(() => Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : (Array.isArray(categoriesResponse) ? categoriesResponse : []), [categoriesResponse]);
  const pagination = useMemo(() => productsResponse?.pagination || { page: 1, pages: 1 }, [productsResponse]);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchWarehouses());
    }
  }, [dispatch, companyId]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(t("toasts.deleteConfirm"))) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success(t("toasts.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error(t("toasts.deleteFailed"));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(t("toasts.bulkDeleteConfirm", { count: selectedIds.length }))) return;
    try {
      await Promise.all(
        selectedIds.map((id) => dispatch(deleteProduct(id)).unwrap())
      );
      toast.success(t("toasts.bulkDeleteSuccess"));
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error(t("toasts.bulkDeleteSomeFailed"));
    }
  };

  const handleRefresh = () => {
    apiClient.clearCache();
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success(t("toasts.refreshSuccess"));
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(249, 115, 22);
    doc.text(t("report.title"), 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      t("report.generatedOn", {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }),
      14,
      30
    );

    const tableColumn = [
      t("report.image"),
      t("report.productDetails"),
      t("report.category"),
      t("report.stockPrice"),
      t("report.status"),
      t("report.totalValue"),
    ];
    const tableRows = [];

    for (const product of products) {
      const basePrice =
        product.pricing?.basePrice ||
        product.pricingId?.basePrice ||
        product.basePrice ||
        product.price ||
        product.unitPrice ||
        product.UnitPrice ||
        product.cost ||
        0;

      const salePrice =
        product.pricing?.salePrice ||
        product.pricingId?.salePrice ||
        product.salePrice ||
        0;

      const effectivePrice =
        salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;

      const stock =
        product.stock?.total ??
        product.stock?.available ??
        product.inventory?.quantity ??
        product.stock ??
        0;
      const totalValue = effectivePrice * stock;
      const status = stock > 0 ? t("report.inStock") : t("report.outOfStock");
      const discount = product.pricing?.discount || product.discount || 0;

      const rowData = [
        "",
        `${product.name}\n${product.description
          ? String(product.description).substring(0, 30) + "..."
          : ""
        }`,
        product.category?.name || product.categoryId?.name || "N/A",
        `${t("report.qty")}: ${stock}\n${t("report.price")}: ${Number(effectivePrice).toLocaleString("en-US", { style: "currency", currency: "RWF", minimumFractionDigits: 0, maximumFractionDigits: 0 })}${discount > 0 ? `\n${t("report.disc")}: ${discount}%` : ""
        }`,
        status,
        `${Number(totalValue).toLocaleString("en-US", { style: "currency", currency: "RWF", minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      ];
      tableRows.push(rowData);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: "grid",
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
      },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === "body") {
          const product = products[data.row.index];
          if (product.image?.url) {
            try {
              doc.addImage(
                product.image.url,
                "JPEG",
                data.cell.x + 1,
                data.cell.y + 1,
                13,
                13
              );
            } catch (e) { }
          }
        }
      },
      minCellHeight: 15,
    });

    doc.save(`inventory-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(t("report.success"));
  };

  const stats = useMemo(() => {
    const s = {
      total: products.length,
      inStock: products.filter((p) => {
        const qty =
          p.stock?.total ??
          p.stock?.available ??
          p.inventory?.quantity ??
          p.stock ??
          0;
        return qty > 0;
      }).length,
      lowStock: products.filter((p) => {
        const qty =
          p.stock?.total ??
          p.stock?.available ??
          p.inventory?.quantity ??
          p.stock ??
          0;
        const threshold = p.stock?.lowStockThreshold ?? 20;
        return qty > 0 && qty < threshold;
      }).length,
      totalValue: products.reduce((sum, p) => {
        const basePrice =
          p.pricing?.basePrice ||
          p.pricingId?.basePrice ||
          p.basePrice ||
          p.price ||
          p.unitPrice ||
          p.UnitPrice ||
          p.cost ||
          0;

        const salePrice =
          p.pricing?.salePrice ??
          p.pricingId?.salePrice ??
          p.salePrice ??
          0;

        const effectivePrice =
          salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;

        const qty =
          p.stock?.total ??
          p.stock?.available ??
          p.inventory?.quantity ??
          p.stock ??
          0;

        return sum + effectivePrice * qty;
      }, 0),
    };
    return s;
  }, [products]);

  return (
    <div className="space-y-6">
      <ProductStats stats={stats} />

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("header.title")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("header.count", { count: stats.total })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("header.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-96 pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              />
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                <Trash2 size={18} />
                {t("header.deleteSelected", { count: selectedIds.length })}
              </button>
            )}

            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-full transition ${isFilterOpen ||
                  currentCategory ||
                  currentWarehouse ||
                  currentStatus
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <Filter size={18} />
                <span>{t("header.filters")}</span>
                {(currentCategory || currentWarehouse || currentStatus) && (
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 ml-1"></span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {t("filters.title")}
                    </h3>
                    <button
                      onClick={() => {
                        updateFilters({
                          search: searchTerm,
                          category: "",
                          warehouse: "",
                          status: "",
                        });
                        setIsFilterOpen(false);
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {t("filters.clearAll")}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t("filters.category")}
                      </label>
                      <select
                        value={currentCategory}
                        onChange={(e) =>
                          updateFilters({ category: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">{t("filters.allCategories")}</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t("filters.shop")}
                      </label>
                      <select
                        value={currentWarehouse}
                        onChange={(e) =>
                          updateFilters({ warehouse: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">{t("filters.allShops")}</option>
                        {warehouses.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t("filters.status")}
                      </label>
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          updateFilters({ status: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">{t("filters.anyStatus")}</option>
                        <option value="active">{t("filters.active")}</option>
                        <option value="inactive">{t("filters.inactive")}</option>
                        <option value="draft">{t("filters.draft")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition text-gray-700"
              title={t("header.clearCache")}
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition text-gray-700"
            >
              <Download size={18} />
              {t("header.exportPdf")}
            </button>

            <Link
              prefetch={true}
              href={routes.add}
              className="flex items-center gap-2 px-4 py-3 bg-[#081422] text-white rounded-xl hover:bg-orange-600 transition font-medium"
            >
              <Plus size={24} />
              {t("header.addProduct")}
            </Link>
          </div>
        </div>

        {/* Product Table */}
        <ProductTable
          products={products}
          loading={productsLoading}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          onDelete={handleDelete}
          viewUrl={routes.view}
          editUrl={routes.edit}
          pagination={pagination}
          onPageChange={(p, l) => updateFilters({ page: p, limit: l })}
        />
      </div>
    </div>
  );
}
