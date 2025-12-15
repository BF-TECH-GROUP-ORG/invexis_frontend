"use client";

import { useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/Landing/Dashboard";
import { getSalesHistory } from "@/services/salesService";
import { getProducts } from "@/services/productsService";
import { getAllShops } from "@/services/shopService";
import useAuth from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tableProducts, setTableProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockQuantity: 0,
    lowStockCount: 0,
    lowStockPercentage: 0,
    outOfStockCount: 0,
    shopName: "All Shops",
    shopRevenue: 0,
  });

  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        // Get company ID from user object
        const companyObj = user?.company || user?.companies?.[0];
        const companyId =
          typeof companyObj === "string"
            ? companyObj
            : companyObj?._id || companyObj?.id;

        if (!companyId) {
          console.warn("No company ID found for dashboard");
          setLoading(false);
          return;
        }

        setLoading(true);

        const [salesResult, productsResult, shopsResult] =
          await Promise.allSettled([
            getSalesHistory(companyId),
            getProducts({ limit: 1000, companyId }), // Fetch enough products for stats
            getAllShops(),
          ]);

        const sales =
          salesResult.status === "fulfilled"
            ? salesResult.value?.data || salesResult.value || []
            : [];

        // Extract products from various possible response structures
        let products = [];
        if (productsResult.status === "fulfilled") {
          const data = productsResult.value;
          if (Array.isArray(data)) {
            products = data;
          } else if (Array.isArray(data?.products)) {
            products = data.products;
          } else if (Array.isArray(data?.data)) {
            products = data.data;
          } else if (Array.isArray(data?.items)) {
            products = data.items;
          }
        }

        const fetchedShops =
          shopsResult.status === "fulfilled" ? shopsResult.value || [] : [];
        setShops(fetchedShops);

        console.log("Fetched products:", products.length, "items");

        // Calculate Inventory Stats
        let totalStockQuantity = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        // Process Products for inventory stats
        products.forEach((product) => {
          const qty = Number(
            product.inventory?.quantity || product.quantity || 0
          );
          const lowStockThreshold = product.inventory?.lowStockThreshold || 10;

          totalStockQuantity += qty;

          if (qty <= 0) {
            outOfStockCount++;
          } else if (qty <= lowStockThreshold) {
            lowStockCount++;
          }
        });

        // Calculate Percentages
        const lowStockPercentage =
          products.length > 0
            ? Math.round((lowStockCount / products.length) * 100)
            : 0;

        setStats({
          totalProducts: products.length,
          totalStockQuantity,
          lowStockCount,
          lowStockPercentage,
          outOfStockCount,
          shopName: "All Shops",
          shopRevenue: 0, // Keep for compatibility
        });

        // Format Products for Table
        const formattedProducts = products.map((product) => {
          const qty = Number(
            product.inventory?.quantity || product.quantity || 0
          );
          const price = Number(
            product.pricing?.salePrice || product.price || 0
          );
          const lowStockThreshold = product.inventory?.lowStockThreshold || 10;

          let status = "In Stock";
          if (qty <= 0) status = "Out of Stock";
          else if (qty <= lowStockThreshold) status = "Low Stock";

          return {
            id: product._id || product.id,
            name: product.name,
            category:
              product.category?.name || product.category || "Uncategorized",
            price: `${price.toLocaleString()} FRW`,
            stock: qty,
            status: status,
          };
        });

        setTableProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <AnalyticsDashboard products={tableProducts} stats={stats} shops={shops} />
  );
}
