"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/features/products/productsSlice";
import AnalyticsDashboard from "@/components/Landing/Dashboard";
import { getSalesHistory } from "@/services/salesService";
import { getAllShops } from "@/services/shopService";
import useAuth from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, status } = useAuth();
  const dispatch = useDispatch();

  // Redux State
  const { items: products, loading: productsLoading } = useSelector(
    (state) => state.products
  );

  // Local State for non-Redux data
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [shops, setShops] = useState([]);
  // const [stats, setStats] = useState(...); // Now derived
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        const companyObj = user?.company || user?.companies?.[0];
        const companyId =
          typeof companyObj === "string"
            ? companyObj
            : companyObj?._id || companyObj?.id;

        if (!companyId) {
          console.warn("No company ID found for dashboard");
          setLoadingLocal(false);
          return;
        }

        setLoadingLocal(true);

        // Dispatch Redux action for products (fetching 1000 for stats)
        dispatch(fetchProducts({ limit: 1000, companyId }));

        // Fetch other data manually
        const [salesResult, shopsResult] = await Promise.allSettled([
          getSalesHistory(companyId),
          getAllShops(),
        ]);

        const sales =
          salesResult.status === "fulfilled"
            ? salesResult.value?.data || salesResult.value || []
            : [];
        setSalesData(sales);

        const fetchedShops =
          shopsResult.status === "fulfilled" ? shopsResult.value || [] : [];
        setShops(fetchedShops);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoadingLocal(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoadingLocal(false);
    }
  }, [status, user, dispatch]);

  // Derived State: Stats and Formatted Products
  const { stats, tableProducts } = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];

    let totalStockQuantity = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    safeProducts.forEach((product) => {
      const qty = Number(product.inventory?.quantity || product.quantity || 0);
      const lowStockThreshold = product.inventory?.lowStockThreshold || 10;

      totalStockQuantity += qty;
      if (qty <= 0) outOfStockCount++;
      else if (qty <= lowStockThreshold) lowStockCount++;
    });

    const lowStockPercentage =
      safeProducts.length > 0
        ? Math.round((lowStockCount / safeProducts.length) * 100)
        : 0;

    const computedStats = {
      totalProducts: safeProducts.length,
      totalStockQuantity,
      lowStockCount,
      lowStockPercentage,
      outOfStockCount,
      shopName: "All Shops",
      shopRevenue: 0,
    };

    const formatted = safeProducts.map((product) => {
      const qty = Number(product.inventory?.quantity || product.quantity || 0);
      const price = Number(product.pricing?.salePrice || product.price || 0);
      const lowStockThreshold = product.inventory?.lowStockThreshold || 10;

      let status = "In Stock";
      if (qty <= 0) status = "Out of Stock";
      else if (qty <= lowStockThreshold) status = "Low Stock";

      return {
        id: product._id || product.id,
        name: product.name,
        category: product.category?.name || product.category || "Uncategorized",
        price: `${price.toLocaleString()} FRW`,
        stock: qty,
        status: status,
      };
    });

    return { stats: computedStats, tableProducts: formatted };
  }, [products]);

  const loading = loadingLocal || productsLoading;

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
