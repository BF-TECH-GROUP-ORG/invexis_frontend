"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import PaymentCards from "./cards";
import PaymentTable from "./table";
import * as PaymentService from "@/services/paymentService";
import { getAllShops } from "@/services/shopService";
import dayjs from "dayjs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const PaymentDashboard = ({ initialParams = {} }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const user = session?.user;
  const companyObj = user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  // Sync state with URL params
  const search = searchParams.get("search") || initialParams.search || "";
  const startDate = searchParams.get("startDate") ? dayjs(searchParams.get("startDate")) : initialParams.startDate ? dayjs(initialParams.startDate) : null;
  const endDate = searchParams.get("endDate") ? dayjs(searchParams.get("endDate")) : initialParams.endDate ? dayjs(initialParams.endDate) : null;
  const selectedShop = searchParams.get("shop") || initialParams.shop || "";
  const selectedPaymentMethod = searchParams.get("method") || initialParams.method || "";
  const selectedStatus = searchParams.get("status") || initialParams.status || "";
  const page = parseInt(searchParams.get("page") || initialParams.page || "0");
  const limit = parseInt(searchParams.get("limit") || initialParams.limit || "10");

  // Role Based Access
  const userRole = user?.role;
  const isWorker = userRole !== 'company_admin';
  const userShops = user?.shops || [];

  // Helper to update filters/state in URL
  const updateFilters = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "All") {
        params.delete(key);
      } else if (dayjs.isDayjs(value)) {
        params.set(key, value.format('YYYY-MM-DD'));
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

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
    staleTime: 5 * 1000 * 60, // 5 minutes
    gcTime: 30 * 1000 * 60, // 30 minutes
  });

  // Query for shops
  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryKey: ['shops', companyId],
    queryFn: () => getAllShops(companyId, options),
    enabled: !!companyId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000, // 2 hours
  });

  const [paymentData, setPaymentData] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);

  const shops = shopsData || [];

  // Filter shops based on worker role
  const availableShops = useMemo(() => {
    if (!isWorker) return shops;
    return shops.filter(shop => {
      return userShops.some(userShop => {
        const userShopId = typeof userShop === 'string' ? userShop : (userShop.id || userShop._id);
        const shopId = shop._id || shop.id;
        return userShopId === shopId;
      });
    });
  }, [shops, isWorker, userShops]);

  // Helper to get shop name
  const getShopName = (shopId) => {
    if (!shopId) return 'N/A';
    const shop = shops.find(s => (s._id || s.id) === shopId);
    return shop?.name || shopId;
  };

  // Filter Logic
  const filteredPayments = useMemo(() => {
    let filtered = paymentData;

    if (isWorker) {
      filtered = filtered.filter(p => {
        return availableShops.some(shop => {
          const shopId = shop._id || shop.id;
          return (p.shop_id || p.shop) === shopId;
        });
      });
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.payment_id || p.transactionId || "").toLowerCase().includes(s) ||
          (p.customer?.name || p.payer || "").toLowerCase().includes(s) ||
          (p.customer?.phone || "").includes(search) ||
          (p.method || p.paymentMethod || "").toLowerCase().includes(s) ||
          (p.reference_id || p.reference || "").toLowerCase().includes(s) ||
          getShopName(p.shop_id || p.shop).toLowerCase().includes(s)
      );
    }

    if (startDate) {
      filtered = filtered.filter((p) =>
        dayjs(p.created_at || p.date).isAfter(startDate.subtract(1, "day"))
      );
    }
    if (endDate) {
      filtered = filtered.filter((p) =>
        dayjs(p.created_at || p.date).isBefore(endDate.add(1, "day"))
      );
    }

    if (selectedShop) {
      filtered = filtered.filter((p) => (p.shop_id === selectedShop || p.shop === selectedShop));
    }

    if (selectedPaymentMethod) {
      filtered = filtered.filter((p) => (p.method === selectedPaymentMethod || p.paymentMethod === selectedPaymentMethod));
    }

    if (selectedStatus) {
      filtered = filtered.filter((p) => p.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    return filtered;
  }, [search, startDate, endDate, selectedShop, selectedPaymentMethod, selectedStatus, paymentData, shops, isWorker, availableShops]);

  useEffect(() => {
    if (!session?.accessToken || !companyId) {
      setPaymentData([]);
      setInternalLoading(false);
      return;
    } else if (paymentsRes) {
      const payments = paymentsRes?.data || paymentsRes || [];
      setPaymentData(payments);
      setInternalLoading(false);
    } else if (paymentsError) {
      console.error('Failed to fetch payments:', paymentsError);
      setPaymentData([]);
      setInternalLoading(false);
    }
  }, [session, companyId, paymentsRes, paymentsError]);

  const showSkeleton = (internalLoading || paymentsLoading || shopsLoading) && !paymentData.length;

  // Sync auto-selection for worker
  useEffect(() => {
    if (isWorker && availableShops.length === 1 && !selectedShop) {
      const shopId = availableShops[0]._id || availableShops[0].id;
      updateFilters({ shop: shopId });
    }
  }, [isWorker, availableShops, selectedShop, updateFilters]);

  // Derived pagination props for table
  const pagination = { page, limit };

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

        {showSkeleton ? (
          <Box sx={{ spaceY: 4 }}>
            <Box sx={{ mb: 4 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
                ))}
              </div>
            </Box>
            <Box>
              <div className="h-[600px] bg-gray-50 rounded-2xl animate-pulse border border-gray-100 p-6 space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-10 w-64 bg-gray-200 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                    <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                  </div>
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-14 bg-gray-200 rounded-xl opacity-60" />
                ))}
              </div>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <PaymentCards payments={filteredPayments} isLoading={internalLoading || paymentsLoading || shopsLoading} />
            </Box>

            <Box>
              <PaymentTable
                payments={paymentData}
                filteredPayments={filteredPayments}
                shops={availableShops}
                isLoading={internalLoading || paymentsLoading || shopsLoading}
                search={search}
                startDate={startDate}
                endDate={endDate}
                selectedShop={selectedShop}
                selectedPaymentMethod={selectedPaymentMethod}
                selectedStatus={selectedStatus}
                pagination={pagination}
                updateFilters={updateFilters}
              />
            </Box>
          </>
        )}
      </div>
    </section>
  );
};

export default PaymentDashboard;
