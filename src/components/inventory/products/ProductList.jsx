"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // We only need pathname now
import { useDispatch, useSelector } from "react-redux";
import { Plus, Filter, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { fetchProducts, deleteProduct } from "@/features/products/productsSlice";
import { fetchCategories } from "@/features/categories/categoriesSlice";
import { fetchWarehouses } from "@/features/warehouses/warehousesSlice";
import ProductTable from "./ProductTable";
import ProductStats from "./ProductStats";

export default function ProductList() {
  const dispatch = useDispatch();
  const pathname = usePathname(); // Only this — no more useRouter()

  // Redux state
  const productsState = useSelector((state) => state.products || {});
  const categoriesState = useSelector((state) => state.categories || {});
  const warehousesState = useSelector((state) => state.warehouses || {});

  const products = Array.isArray(productsState.items) ? productsState.items : [];
  const categories = Array.isArray(categoriesState.items) ? categoriesState.items : [];
  const warehouses = Array.isArray(warehousesState.items) ? warehousesState.items : [];

  const loading = productsState.loading || false;
  const pagination = productsState.pagination || { page: 1, pages: 1 };

  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    warehouse: "",
    status: "",
  });

  // Build base path safely (works whether you're at /inventory/products or nested)
  const basePath = pathname?.replace(/\/$/, "") || "/inventory/products";

  // All routes now use <Link> — no router.push() anywhere
  const routes = {
    add: `${basePath}/add`,
    view: (id) => `${basePath}/${id}`,
    edit: (id) => `${basePath}/${id}/edit`,
  };

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
    dispatch(fetchCategories());
    dispatch(fetchWarehouses());
  }, [dispatch]);

  useEffect(() => {
    const page = pagination?.page || 1;
    dispatch(
      fetchProducts({
        page,
        limit: 20,
        search: filters.search || undefined,
        category: filters.category || undefined,
        warehouse: filters.warehouse || undefined,
        status: filters.status || undefined,
      })
    );
  }, [dispatch, pagination?.page, filters]);

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
      await Promise.all(selectedIds.map((id) => dispatch(deleteProduct(id)).unwrap()));
      toast.success("Products deleted");
      setSelectedIds([]);
    } catch {
      toast.error("Some failed");
    }
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Category", "Price", "Stock", "Status"],
      ...products.map((p) => [
        p.name,
        p.category?.name || "N/A",
        p.price,
        p.stock,
        p.stock > 0 ? "In Stock" : "Out of Stock",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock > 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 20).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  return (
    <div className="space-y-6">
      <ProductStats stats={stats} />

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">{stats.total} total products</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 size={18} />
                Delete ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter size={18} />
              Filters
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download size={18} />
              Export
            </button>

            {/* Add Product — Pure <Link> */}
            <Link
            prefetch={true}
              href={routes.add}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition shadow-sm"
            >
              <Plus size={18} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search + Category */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-6 bg-gray-50 p-5 rounded-lg border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select
                  value={filters.warehouse}
                  onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Any Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Table — Now passes Link-ready hrefs */}
        <ProductTable
          products={products}
          loading={loading}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          onDelete={handleDelete}
          // These are now pure URLs → your ProductTable can use <Link href={viewUrl}>
          viewUrl={routes.view}
          editUrl={routes.edit}
        />
      </div>
    </div>
  );
}