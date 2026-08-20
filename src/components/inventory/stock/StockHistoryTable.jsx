// src/components/inventory/stock/StockHistoryTable.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  RefreshCw,
  Search,
} from "lucide-react";
import Table from "@mui/material/Table";
import AuthService from "@/services/AuthService";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Skeleton from "@mui/material/Skeleton";
import { getStockChangeHistory } from "@/services/stockService";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function StockHistoryTable({ companyId, initialParams = {}, updateFilters }) {
  const t = useTranslations("stockManagement.history");
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Sync state with URL params
  const searchTerm = searchParams.get("search") || initialParams.search || "";
  const filterType = searchParams.get("type") || initialParams.type || "all";
  const timeframe = searchParams.get("timeframe") || initialParams.timeframe || "all";
  const startDate = searchParams.get("startDate") || initialParams.startDate || "";
  const endDate = searchParams.get("endDate") || initialParams.endDate || "";
  const reason = searchParams.get("reason") || initialParams.reason || "all";
  
  const page = parseInt(searchParams.get("page") || initialParams.page || "0");
  const rowsPerPage = parseInt(searchParams.get("limit") || initialParams.limit || "10");

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Debounce the search input to update the URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        updateFilters({ search: debouncedSearch, page: 0 });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [debouncedSearch, updateFilters, searchTerm]);

  // Sync debounced search if URL changes externally
  useEffect(() => {
    setDebouncedSearch(searchTerm);
  }, [searchTerm]);

  const options = useMemo(() => session?.accessToken ? {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  } : {}, [session?.accessToken]);

  // Use React Query for data fetching
  const {
    data: result,
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["stock-change-history", { 
      page: page + 1, 
      limit: rowsPerPage, 
      companyId,
      timeframe,
      startDate,
      endDate,
      reason,
      type: filterType
    }],
    queryFn: () => getStockChangeHistory({ 
      page: page + 1, 
      limit: rowsPerPage, 
      companyId,
      timeframe,
      startDate,
      endDate,
      reason,
      type: filterType === "all" ? undefined : filterType
    }, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 5 * 1000 * 60,
  });

  const stats = result?.data?.stats || result?.stats || null;
  const changes = result?.data?.history || result?.history || result?.data || result || [];
  const total = result?.data?.pagination?.total || result?.pagination?.total || 0;

  // Fetch all workers for the company to map user IDs to names
  const { data: workersRes } = useQuery({
    queryKey: ["workers", companyId],
    queryFn: () => {
      const { getWorkersByCompanyId } = require("@/services/workersService");
      return getWorkersByCompanyId(companyId, options);
    },
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const workers = workersRes?.data || workersRes || [];

  // Map user IDs to names for easy lookup
  const userMap = useMemo(() => {
    const map = {};
    workers.forEach(w => {
      if (w._id) map[String(w._id)] = w;
      if (w.id) map[String(w.id)] = w;
      if (w.userId) map[String(w.userId)] = w;
      if (w.user?._id) map[String(w.user._id)] = w;
      if (w.user?.id) map[String(w.user.id)] = w;
    });
    return map;
  }, [workers]);

  // Client-side filtering logic (in case API doesn't filter perfectly)
  const filteredChanges = useMemo(() => {
    return changes.filter((change) => {
      const productName = (change.product?.name || change.productName || "").toLowerCase();
      const sku = (change.sku || change.product?.sku || change.productSku || "").toLowerCase();
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = q === "" || productName.includes(q) || sku.includes(q);

      const isIn = ["in", "restock", "return"].includes(change.type);
      const isOut = ["out", "sale"].includes(change.type);

      const matchesFilter = filterType === "all" || (filterType === "in" && isIn) || (filterType === "out" && isOut);
      return matchesSearch && matchesFilter;
    });
  }, [changes, searchTerm, filterType]);

  const formatDate = (dateString) => {
    if (!dateString) return t("table.na");
    return new Date(dateString).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <History size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("title")}</h3>
            <p className="text-sm text-gray-500">{t("subtitle")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => updateFilters({ type: e.target.value, page: 0 })}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm font-medium"
              >
                <option value="all">{t("allTypes") || "All Types"}</option>
                <option value="in">{t("table.stockIn")}</option>
                <option value="out">{t("table.stockOut")}</option>
              </select>

              <select
                value={timeframe}
                onChange={(e) => updateFilters({ timeframe: e.target.value, page: 0, startDate: "", endDate: "" })}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm font-medium"
              >
                <option value="all">Any Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>

              <select
                value={reason}
                onChange={(e) => updateFilters({ reason: e.target.value, page: 0 })}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm font-medium"
              >
                <option value="all">All Reasons</option>
                <option value="sale">Sale</option>
                <option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
                <option value="restock">Restock</option>
                <option value="manual">Manual Adjustment</option>
                <option value="other">Other</option>
              </select>

              <button
                onClick={() => refetch()}
                className="px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95 shadow-sm shadow-orange-200"
              >
                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                {t("refresh")}
              </button>
            </div>
          </div>

          {timeframe === "custom" && (
            <div className="flex items-center gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-xl animate-in fade-in slide-in-from-top-2">
               <div className="flex-1">
                  <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1 ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => updateFilters({ startDate: e.target.value, page: 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
               </div>
               <div className="flex-1">
                  <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1 ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => updateFilters({ endDate: e.target.value, page: 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
               </div>
            </div>
          )}
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">{t("stats.totalInflow")}</p>
              <p className="text-lg font-semibold text-green-700">{stats.totalInflow ?? 0}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">{t("stats.totalOutflow")}</p>
              <p className="text-lg font-semibold text-red-700">{stats.totalOutflow ?? 0}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">{t("stats.netChange")}</p>
              <p className="text-lg font-semibold text-gray-900">{stats.netChange ?? 0}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">{t("stats.totalChanges")}</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalChanges ?? 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="overflow-x-auto shadow-sm rounded-xl border border-gray-100">
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold text-gray-700">{t("table.type")}</TableCell>
                <TableCell className="font-semibold text-gray-700">{t("table.product")}</TableCell>
                <TableCell className="font-semibold text-gray-700">{t("table.sku")}</TableCell>
                <TableCell align="center" className="font-semibold text-gray-700">{t("table.quantity")}</TableCell>
                <TableCell className="font-semibold text-gray-700">{t("table.reason")}</TableCell>
                <TableCell className="font-semibold text-gray-700">{t("table.date")}</TableCell>
                <TableCell className="font-semibold text-gray-700">{t("table.by")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={40} sx={{ mx: "auto" }} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : error ? (
        <div className="p-12 text-center">
          <p className="text-red-500">{error.message || t("errors.loadFailed")}</p>
          <button onClick={() => refetch()} className="mt-2 text-orange-600 hover:underline">{t("errors.tryAgain")}</button>
        </div>
      ) : filteredChanges.length === 0 ? (
        <div className="p-12 text-center">
          <History size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t("errors.noChanges")}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-sm rounded-xl border border-gray-100">
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold text-gray-700">{t("table.type")}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{t("table.product")}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{t("table.sku")}</TableCell>
                  <TableCell align="center" className="font-semibold text-gray-700">{t("table.quantity")}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{t("table.reason")}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{t("table.date")}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{t("table.by")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChanges.map((change, index) => {
                  const isIn = ["in", "restock", "return"].includes(change.type);
                  const isOut = ["out", "sale"].includes(change.type);
                  const displayLabel = isIn ? t("table.stockIn") : isOut ? t("table.stockOut") : change.type ? t("table.change") : t("table.change");
                  const qty = typeof change.qty !== "undefined" ? change.qty : change.quantity ?? 0;
                  const qtyText = typeof qty === "number" ? (qty >= 0 ? `+${qty}` : `${qty}`) : String(qty);
                  const productName = change.product?.name || change.productName || "Unknown";
                  const sku = change.sku || change.product?.sku || change.productSku || "N/A";

                  let by = t("table.system");
                  const rawUserId = change.userId || change.createdBy || (typeof change.user === 'string' ? change.user : change.user?.id || change.user?._id) || change.performedBy;
                  
                  const matchedUser = (change.user && typeof change.user === "object")
                    ? change.user 
                    : (rawUserId ? userMap[String(rawUserId)] : null);

                  if (matchedUser) {
                    if (matchedUser.firstName || matchedUser.lastName) {
                      by = `${matchedUser.firstName || ""} ${matchedUser.lastName || ""}`.trim();
                    } else if (matchedUser.name) {
                      by = matchedUser.name;
                    } else if (matchedUser.username) {
                      by = matchedUser.username;
                    } else if (matchedUser.email) {
                      by = matchedUser.email;
                    }
                  } else if (typeof change.performedByName === "string" && change.performedByName) {
                    by = change.performedByName;
                  }

                  return (
                    <TableRow key={change._id || index} hover>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isIn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {isIn ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                          {displayLabel}
                        </div>
                      </TableCell>
                      <TableCell><span className="font-medium text-gray-900">{productName}</span></TableCell>
                      <TableCell><span className="text-gray-600 font-mono text-sm">{sku}</span></TableCell>
                      <TableCell align="center"><span className={`font-semibold ${isIn ? "text-green-600" : "text-red-600"}`}>{qtyText}</span></TableCell>
                      <TableCell><span className="text-gray-600">{change.reason || (change.meta && change.meta.reason) || "—"}</span></TableCell>
                      <TableCell><span className="text-gray-500 text-sm">{formatDate(change.createdAt)}</span></TableCell>
                      <TableCell><span className="text-gray-600">{by}</span></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="p-2 flex justify-end border-t border-gray-100">
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => updateFilters({ page: newPage })}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={(e) => updateFilters({ limit: Number(e.target.value), page: 0 })}
            />
          </div>
        </>
      )}
    </div>
  );
}
