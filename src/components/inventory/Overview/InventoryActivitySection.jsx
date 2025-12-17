import React from "react";
import { History, ShoppingBag, ArrowRight, Package } from "lucide-react";

const ActivityBadge = ({ type }) => {
  switch (type) {
    case "RESTOCK":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Restock
        </span>
      );
    case "SALE":
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

const InventoryActivitySection = ({ activities, recentProducts }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Recent Activity
          </h3>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
            View Log
          </button>
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
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="py-3 pl-1">
                    <ActivityBadge type={activity.type} />
                  </td>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">
                    {activity.item}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            New Products
          </h3>
          <button className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1">
          <div className="space-y-4">
            {(recentProducts && recentProducts.length > 0
              ? recentProducts
              : [1, 2, 3]
            ).map((item, i) => {
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
                    <p className="text-xs text-gray-500">Added by {addedBy}</p>
                  </div>
                  <div className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-md">
                    Active
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryActivitySection;
