"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Filter,
  Download,
  Trash2,
  X,
  ChevronDown,
  Check,
  Search,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useSession } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import {
  fetchProducts,
  deleteProduct,
} from "@/features/products/productsSlice";
import { fetchCategories } from "@/features/categories/categoriesSlice";
import { fetchWarehouses } from "@/features/warehouses/warehousesSlice";
import ProductTable from "./ProductTable";
import ProductStats from "./ProductStats";

export default function ProductList() {
  const dispatch = useDispatch();
  const pathname = usePathname(); // Only this — no more useRouter()
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  // Redux state
  const productsState = useSelector((state) => state.products || {});
  const categoriesState = useSelector((state) => state.categories || {});
  const warehousesState = useSelector((state) => state.warehouses || {});

  const allProducts = Array.isArray(productsState.items)
    ? productsState.items
    : [];

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

  const categories = Array.isArray(categoriesState.items)
    ? categoriesState.items
    : [];
  const warehouses = Array.isArray(warehousesState.items)
    ? warehousesState.items
    : [];

  const loading = productsState.loading || false;
  const pagination = productsState.pagination || { page: 1, pages: 1 };

  const [selectedIds, setSelectedIds] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    warehouse: "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const maxWait = 1000; // Increased delay for better typing experience
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchTerm) return prev;
        return { ...prev, search: searchTerm };
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const basePath = pathname?.replace(/\/$/, "") || "/inventory/products";

  const routes = {
    add: `${basePath}/add-wizard`,
    view: (id) => `${basePath}/${id}`,
    edit: (id) => `${basePath}/${id}/edit`,
  };

  useEffect(() => {
    if (companyId) {
      // dispatch(fetchProducts({ page: 1, limit: 20, companyId })); // Handled by the second useEffect
      dispatch(fetchCategories({ companyId }));
      dispatch(fetchWarehouses());
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    const page = pagination?.page || 1;
    if (companyId) {
      dispatch(
        fetchProducts({
          page,
          limit: 20,
          search: filters.search || undefined,
          category: filters.category || undefined,
          warehouse: filters.warehouse || undefined,
          status: filters.status || undefined,
          companyId,
        })
      );
    }
  }, [dispatch, pagination?.page, filters, companyId]);

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
    if (!confirm("Delete this product?")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} products?`)) return;
    try {
      await Promise.all(
        selectedIds.map((id) => dispatch(deleteProduct(id)).unwrap())
      );
      toast.success("Products deleted");
      setSelectedIds([]);
    } catch {
      toast.error("Some failed");
    }
  };

  const handleRefresh = () => {
    apiClient.clearCache();
    if (companyId) {
      dispatch(fetchProducts({ page: 1, limit: 20, companyId }));
      toast.success("Cache cleared & data refreshed");
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();

    // Add Header
    doc.setFontSize(20);
    doc.setTextColor(249, 115, 22); // Orange color
    doc.text("Inventory Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      14,
      30
    );

    const tableColumn = [
      "Image",
      "Product Details",
      "Category",
      "Stock & Price",
      "Status",
      "Total Value",
    ];
    const tableRows = [];

    for (const product of products) {
      const basePrice =
        product.pricing?.basePrice ||
        product.pricingId?.basePrice ||
        product.price ||
        0;
      const salePrice =
        product.pricing?.salePrice || product.pricingId?.salePrice || 0;
      const effectivePrice =
        salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;

      const stock =
        product.stock?.total ??
        product.stock?.available ??
        product.inventory?.quantity ??
        product.stock ??
        0;
      const totalValue = effectivePrice * stock;
      const status = stock > 0 ? "In Stock" : "Out of Stock";
      const discount = product.pricing?.discount || product.discount || 0;

      // Format data for the table
      const rowData = [
        "", // Placeholder for image
        `${product.name}\n${product.description
          ? String(product.description).substring(0, 30) + "..."
          : ""
        }`,
        product.category?.name || product.categoryId?.name || "N/A",
        `Qty: ${stock}\nPrice: $${effectivePrice.toLocaleString()}${discount > 0 ? `\nDisc: ${discount}%` : ""
        }`,
        status,
        `$${totalValue.toLocaleString()}`,
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
        0: { cellWidth: 15 }, // Image column
        1: { cellWidth: 50 }, // Product Details
      },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === "body") {
          const product = products[data.row.index];
          if (product.image?.url) {
            try {
              // Attempt to add image if URL is accessible
              // Note: This might fail if CORS is not configured on the image server
              doc.addImage(
                product.image.url,
                "JPEG",
                data.cell.x + 1,
                data.cell.y + 1,
                13,
                13
              );
            } catch (e) {
              // Fallback or ignore
            }
          }
        }
      },
      minCellHeight: 15,
    });

    doc.save(`inventory-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF Report generated successfully");
  };

  // Calculate stats dynamically from actual product data
  const stats = {
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
        p.pricing?.basePrice ?? p.pricingId?.basePrice ?? p.price ?? 0;
      const salePrice = p.pricing?.salePrice ?? p.pricingId?.salePrice ?? 0;
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

  return (
    <div className="space-y-6">
      <ProductStats stats={stats} />

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} total products
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
                placeholder="Search products..."
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
                Delete ({selectedIds.length})
              </button>
            )}

            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-full transition ${isFilterOpen ||
                  filters.category ||
                  filters.warehouse ||
                  filters.status
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <Filter size={18} />
                <span>Filters</span>
                {(filters.category || filters.warehouse || filters.status) && (
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 ml-1"></span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Filter Products
                    </h3>
                    <button
                      onClick={() => {
                        setFilters({
                          search: filters.search,
                          category: "",
                          warehouse: "",
                          status: "",
                        });
                        setIsFilterOpen(false);
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Shop
                      </label>
                      <select
                        value={filters.warehouse}
                        onChange={(e) =>
                          setFilters({ ...filters, warehouse: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">All Shops</option>
                        {warehouses.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">Any Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition text-gray-700"
              title="Clear Cache & Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition text-gray-700"
            >
              <Download size={18} />
              Export PDF
            </button>

            <Link
              prefetch={true}
              href={routes.add}
              className="flex items-center gap-2 px-4 py-3 bg-[#081422] text-white rounded-xl hover:bg-orange-600 transition font-medium"
            >
              <Plus size={24} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Product Table */}
        <ProductTable
          products={products}
          loading={loading}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          onDelete={handleDelete}
          viewUrl={routes.view}
          editUrl={routes.edit}
        />
      </div>
    </div>
  );
}
