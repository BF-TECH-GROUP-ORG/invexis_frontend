import React from "react";
import { AlertCircle, TrendingUp, Package } from "lucide-react";

const ProductRiskSection = ({ topProducts, riskProducts }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Stockout Risk List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              Stockout Risks
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">
              Items predicted to run out soon
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="font-bold uppercase tracking-wider py-3 pl-1">
                  Product
                </th>
                <th className="font-bold uppercase tracking-wider py-3 text-center">
                  Remaining
                </th>
                <th className="font-bold uppercase tracking-wider py-3 text-right pr-1">
                  Burn Rate
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {riskProducts.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="py-4 pl-1">
                    <div className="font-bold text-gray-900 dark:text-white mb-0.5">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {item.stock} in stock
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                        item.remainingDays <= 3
                          ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                          : "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30"
                      }`}
                    >
                      {item.remainingDays} Days
                    </span>
                  </td>
                  <td className="py-4 text-right pr-1 font-bold text-gray-600 dark:text-gray-300 font-mono">
                    {item.burnRate}/day
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Profit Products */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              Top Performers
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">
              Highest grossing products this month
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4">
          {topProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-750 hover:border-orange-200 hover:bg-orange-50/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    index < 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-base">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 font-medium mt-0.5">
                    <Package className="w-3 h-3" />
                    {product.unitsSold} units sold
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                  +${product.profit.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 font-medium">Profit</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductRiskSection;
