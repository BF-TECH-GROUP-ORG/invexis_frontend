"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import PaymentCards from "./cards";
import PaymentTable from "./table";
import * as PaymentService from "@/services/paymentService";
import { getAllShops } from "@/services/shopService";
import dayjs from "dayjs";

const PaymentDashboard = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Role Based Access
  const userRole = user?.role;
  const isWorker = userRole !== 'company_admin';
  const userShops = user?.shops || [];

  // Prepare query options
  const options = useMemo(() => session?.accessToken ? {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  } : {}, [session?.accessToken]);

  // Query for company payments
  const { data: paymentsRes, isLoading: paymentsLoading, error: paymentsError } = useQuery({
    queryKey: ['payments', 'company', companyId],
    queryFn: () => PaymentService.getCompanyPayments(companyId, options),
    enabled: !!companyId && !!session?.accessToken,
    retry: 1,
    staleTime: 60 * 1000,
  });

  // Query for shops
  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryKey: ['shops', companyId],
    queryFn: () => getAllShops(companyId),
    enabled: !!companyId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const [paymentData, setPaymentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const shops = shopsData || [];

  // Filter shops based on worker role
  const availableShops = useMemo(() => {
    if (!isWorker) return shops;

    // If worker, only showassigned shops
    return shops.filter(shop => {
      return userShops.some(userShop => {
        const userShopId = typeof userShop === 'string' ? userShop : (userShop.id || userShop._id);
        const shopId = shop._id || shop.id;
        return userShopId === shopId;
      });
    });
  }, [shops, isWorker, userShops]);

  // Auto-select shop for workers with single shop
  useEffect(() => {
    if (isWorker && availableShops.length === 1 && !selectedShop) {
      const shopId = availableShops[0]._id || availableShops[0].id;
      setSelectedShop(shopId);
    }
  }, [isWorker, availableShops, selectedShop]);

  // Helper to get shop name
  const getShopName = (shopId) => {
    if (!shopId) return 'N/A';
    const shop = shops.find(s => (s._id || s.id) === shopId);
    return shop?.name || shopId;
  };

  // Filter Logic
  const filteredPayments = useMemo(() => {
    let filtered = paymentData;

    // Enforce worker shop restriction
    if (isWorker) {
      filtered = filtered.filter(p => {
        // Check if payment shop is in user's allowed shops
        return availableShops.some(shop => {
          const shopId = shop._id || shop.id;
          return (p.shop_id || p.shop) === shopId;
        });
      });
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (p) =>
          (p.payment_id || p.transactionId || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.customer?.name || p.payer || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.customer?.phone || "").includes(search) ||
          (p.method || p.paymentMethod || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.reference_id || p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
          getShopName(p.shop_id || p.shop).toLowerCase().includes(search.toLowerCase())
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((p) =>
        dayjs(p.created_at || p.date).isAfter(dayjs(startDate).subtract(1, "day"))
      );
    }
    if (endDate) {
      filtered = filtered.filter((p) =>
        dayjs(p.created_at || p.date).isBefore(dayjs(endDate).add(1, "day"))
      );
    }

    // Shop filter
    if (selectedShop) {
      filtered = filtered.filter((p) => (p.shop_id === selectedShop || p.shop === selectedShop));
    }

    // Payment method filter
    if (selectedPaymentMethod) {
      filtered = filtered.filter((p) => (p.method === selectedPaymentMethod || p.paymentMethod === selectedPaymentMethod));
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((p) => p.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    return filtered;
  }, [search, startDate, endDate, selectedShop, selectedPaymentMethod, selectedStatus, paymentData, shops]);

  const filterProps = {
    search, setSearch,
    startDate, setStartDate,
    endDate, setEndDate,
    selectedShop, setSelectedShop,
    selectedPaymentMethod, setSelectedPaymentMethod,
    selectedStatus, setSelectedStatus,
  };

  useEffect(() => {
    if (!session?.accessToken || !companyId) {
      // When not authenticated, don't show sample data - show empty state
      setPaymentData([]);
      setIsLoading(false);
      return;
    } else if (paymentsRes) {
      // Use real API data - extract from response.data
      const payments = paymentsRes?.data || paymentsRes || [];
      setPaymentData(payments);
      setIsLoading(false);
    } else if (paymentsError) {
      // On error, show empty state
      console.error('Failed to fetch payments:', paymentsError);
      setPaymentData([]);
      setIsLoading(false);
    }
  }, [session, companyId, paymentsRes, paymentsError]);

  const loading = isLoading || paymentsLoading || shopsLoading;

  if (loading && !paymentData.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        <Box sx={{ textAlign: "center", width: 300 }}>
          <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Loading payment dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <section className="w-full">
      <div className="w-full">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.5px",
              mb: 1,
            }}
          >
            Payment History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and view all transactions for your business
          </Typography>
        </Box>

        {/* Section 1: Main KPI Cards */}
        <Box sx={{ mb: 4 }}>
          <PaymentCards payments={filteredPayments} isLoading={loading} />
        </Box>

        {/* Section 2: Payment Table */}
        <Box>
          <PaymentTable
            payments={paymentData}
            filteredPayments={filteredPayments}
            shops={availableShops}
            isLoading={loading}
            {...filterProps}
          />
        </Box>
      </div>
    </section>
  );
};

export default PaymentDashboard;
