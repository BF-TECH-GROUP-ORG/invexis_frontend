import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  History,
  ShoppingBag,
  ArrowRight,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { getProducts } from "@/services/productsService";

const PAGE_SIZE = 5;

const ActivityBadge = ({ type }) => {
  const t = useTranslations("inventoryOverview.activity.types");
  switch (type) {
    case "RESTOCK":
    case "STOCK_IN":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          {t("restock")}
        </span>
      );
    case "SALE":
    case "STOCK_OUT":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          {t("sale")}
        </span>
      );
    case "ADJUSTMENT":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {t("adjustment")}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {t("other")}
        </span>
      );
  }
};

const InventoryActivitySection = ({ activities = [], recentProducts = [] }) => {
  const tActivity = useTranslations("inventoryOverview.activity");
  const tNewProducts = useTranslations("inventoryOverview.newProducts");
  const tRisk = useTranslations("inventoryOverview.risk");
  const { data: session } = useSession();
  const [actPage, setActPage] = useState(0);
  const [prodPage, setProdPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract companyId from session
  const companyId = useMemo(() => {
    const companyObj = session?.user?.companies?.[0];
    return typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id;
  }, [session]);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      if (!companyId) return;
      try {
        const productsList = await getProducts(companyId);
        setProducts(productsList || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [companyId]);

  // Create a map of product ID to product name for quick lookup
  const productNameMap = useMemo(() => {
    const map = {};
    products.forEach((product) => {
      if (product._id || product.id) {
        map[product._id || product.id] = product.name || product.productName || "Product";
      }
    });
    return map;
  }, [products]);

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
            {tActivity("title")}
          </h3>
          <div className="flex items-center gap-3">
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              {tActivity("viewLog")}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="font-medium py-3 pl-1">{tActivity("table.action")}</th>
                <th className="font-medium py-3">{tActivity("table.item")}</th>
                <th className="font-medium py-3 text-right">{tActivity("table.qty")}</th>
                <th className="font-medium py-3 text-right">{tActivity("table.time")}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {actSlice.length > 0 ? (
                actSlice.map((activity) => {
                  // Get real product name from the map or use the original item
                  const productId = activity.productId || activity.id;
                  const displayProductName = productId && productNameMap[productId]
                    ? productNameMap[productId]
                    : activity.item || activity.productName || "Unknown Product";

                  return (
                    <tr
                      key={activity.id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="py-3 pl-1">
                        <ActivityBadge type={activity.type} />
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {displayProductName}
                        <div className="text-xs text-gray-400 mt-1">
                          {activity.shop ? `${activity.shop} · ` : ""}
                          {activity.performedBy
                            ? tActivity("by", { user: activity.performedBy })
                            : ""}
                        </div>
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${activity.quantity > 0
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    {tActivity("noActivity")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {activities?.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              {tRisk("pagination", {
                start: actPage * PAGE_SIZE + 1,
                end: Math.min((actPage + 1) * PAGE_SIZE, activities.length),
                total: activities.length
              })}
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
            {tNewProducts("title")}
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory/products"
              className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              {tNewProducts("viewAll")} <ArrowRight className="w-3 h-3" />
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
                        {tNewProducts("addedBy", { user: addedBy })}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-md">
                      {tNewProducts("active")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-gray-500">
                {tNewProducts("noProducts")}
              </div>
            )}
          </div>
        </div>

        {recentProducts?.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              {tRisk("pagination", {
                start: prodPage * PAGE_SIZE + 1,
                end: Math.min((prodPage + 1) * PAGE_SIZE, recentProducts.length),
                total: recentProducts.length
              })}
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
