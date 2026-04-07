"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2, Eye, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MaterialStockTable - Simplified table for non-saleable items
 */
export default function MaterialStockTable({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectIds = () => { },
  onDelete = () => { },
  viewUrl = () => "",
  editUrl = () => "",
  pagination = { page: 1, pages: 1 },
  onPageChange = () => { },
}) {
  const t = useTranslations("products.table");
  const commonT = useTranslations("common");

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      onSelectIds([]);
    } else {
      onSelectIds(products.map((p) => p._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fbfcff]">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t border-gray-50">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-50 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#fbfcff] text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4">Product / Asset</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Brand / Manufacturer</th>
              <th className="px-6 py-4 text-center">Stock Level</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {products.length > 0 ? (
                products.map((product, index) => {
                  const stock = product.shopInventory?.quantity ?? product.stock ?? 0;
                  const threshold = product.shopInventory?.lowStockThreshold ?? 10;
                  const isLowStock = stock > 0 && stock <= threshold;
                  const isOutOfStock = stock <= 0;

                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(product._id) ? "bg-gray-50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => toggleSelect(product._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate" title={product.name}>
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate uppercase mt-0.5" title={product.sku}>
                              {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {product.brand || product.manufacturer || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-emerald-600"}`}>
                            {stock.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-medium">Units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase flex items-center gap-1">
                              <AlertCircle size={10} /> Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={viewUrl(product._id)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={editUrl(product._id)}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => onDelete(product._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-gray-50 text-gray-400">
                        <Package size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">No materials found in stock</p>
                      <p className="text-xs text-gray-400">Click the add button to register new internal assets</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 bg-[#fbfcff] border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing Page <span className="font-bold text-gray-900">{pagination.page}</span> of <span className="font-bold text-gray-900">{pagination.pages}</span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 text-xs font-medium border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 text-xs font-medium border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
