import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  ShoppingBag,
  ArrowRight,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 5;

const ActivityBadge = ({ type }) => {
  switch (type) {
    case "RESTOCK":
    case "STOCK_IN":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Restock
        </span>
      );
    case "SALE":
    case "STOCK_OUT":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          Sale
        </span>
      );
    case "ADJUSTMENT":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Adjustment
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Other
        </span>
      );
  }
};

const InventoryActivitySection = ({ activities = [], recentProducts = [] }) => {
  const [actPage, setActPage] = useState(0);
  const [prodPage, setProdPage] = useState(0);

  const actPages = Math.ceil((activities?.length || 0) / PAGE_SIZE) || 1;
  const prodPages = Math.ceil((recentProducts?.length || 0) / PAGE_SIZE) || 1;

  const actSlice = (activities || []).slice(
    actPage * PAGE_SIZE,
    actPage * PAGE_SIZE + PAGE_SIZE
  );
  const prodSlice = (recentProducts || []).slice(
    prodPage * PAGE_SIZE,
    prodPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Recent Activity
          </h3>
          <div className="flex items-center gap-3">
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              View Log
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="font-medium py-3 pl-1">Action</th>
                <th className="font-medium py-3">Item</th>
                <th className="font-medium py-3 text-right">Qty</th>
                <th className="font-medium py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {actSlice.length > 0 ? (
                actSlice.map((activity) => (
                  <tr
                    key={activity.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="py-3 pl-1">
                      <ActivityBadge type={activity.type} />
                    </td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">
                      {activity.item}
                      <div className="text-xs text-gray-400 mt-1">
                        {activity.shop ? `${activity.shop} · ` : ""}
                        {activity.performedBy
                          ? `By ${activity.performedBy}`
                          : ""}
                      </div>
                    </td>
                    <td
                      className={`py-3 text-right font-medium ${
                        activity.quantity > 0
                          ? "text-emerald-600"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {activity.quantity > 0 ? "+" : ""}
                      {activity.quantity}
                    </td>
                    <td className="py-3 text-right text-gray-500 text-xs">
                      {activity.time}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {activities?.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              Showing {actPage * PAGE_SIZE + 1}–
              {Math.min((actPage + 1) * PAGE_SIZE, activities.length)} of{" "}
              {activities.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActPage((p) => Math.max(0, p - 1))}
                disabled={actPage === 0}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActPage((p) => Math.min(actPages - 1, p + 1))}
                disabled={actPage >= actPages - 1}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            New Products
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory/products"
              className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <div className="space-y-4">
            {prodSlice && prodSlice.length > 0 ? (
              prodSlice.map((item, i) => {
                const isObject = typeof item === "object";
                const name = isObject ? item.name : `New Item #${item}`;
                const addedBy = isObject ? item.addedBy : "Admin";

                return (
                  <div
                    key={isObject ? item.id : item}
                    className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-solid hover:border-orange-200 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Added by {addedBy}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-md">
                      Active
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-gray-500">
                No recent products
              </div>
            )}
          </div>
        </div>

        {recentProducts?.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              Showing {prodPage * PAGE_SIZE + 1}–
              {Math.min((prodPage + 1) * PAGE_SIZE, recentProducts.length)} of{" "}
              {recentProducts.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProdPage((p) => Math.max(0, p - 1))}
                disabled={prodPage === 0}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setProdPage((p) => Math.min(prodPages - 1, p + 1))
                }
                disabled={prodPage >= prodPages - 1}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryActivitySection;
