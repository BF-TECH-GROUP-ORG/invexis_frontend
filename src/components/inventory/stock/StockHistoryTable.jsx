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
    queryKey: ["stock-change-history", { page: page + 1, limit: rowsPerPage, companyId }],
    queryFn: () => getStockChangeHistory({ page: page + 1, limit: rowsPerPage, companyId }, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 5 * 1000 * 60,
  });

  const stats = result?.data?.stats || result?.stats || null;
  const changes = result?.data?.history || result?.history || result?.data || result || [];
  const total = result?.data?.pagination?.total || result?.pagination?.total || 0;

  // Cache for resolved user details
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    let mounted = true;
    const idsFromChanges = Array.from(new Set(changes.map((c) => c.userId || (c.user && (c.user.id || c.user)) || c.createdBy).filter(Boolean)));
    const idsFromStats = Array.from(new Set((stats?.topUsers || []).map((u) => u.userId).filter(Boolean)));
    const ids = Array.from(new Set([...idsFromChanges, ...idsFromStats]));
    const missing = ids.filter((id) => !userMap[id]);

    if (missing.length === 0) return;

    (async () => {
      try {
        const promises = missing.map((id) =>
          AuthService.getUserById(id)
            .then((res) => ({ id, user: res?.user || res?.data?.user || res }))
            .catch(() => ({ id, user: null }))
        );
        const results = await Promise.all(promises);
        if (!mounted) return;
        setUserMap((prev) => {
          const copy = { ...prev };
          results.forEach((r) => { if (r.user) copy[r.id] = r.user; });
          return copy;
        });
      } catch (e) { }
    })();
    return () => (mounted = false);
  }, [changes, stats, userMap]);

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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => updateFilters({ type: e.target.value, page: 0 })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
            >
              <option value="all">{t("history.allTypes") || "All Types"}</option>
              <option value="in">{t("table.stockIn")}</option>
              <option value="out">{t("table.stockOut")}</option>
            </select>

            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              {t("refresh")}
            </button>
          </div>
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
        <div className="p-0">
          <Table size="small">
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
          <Table size="small">
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
                if (change.user && typeof change.user === "object") {
                  if (change.user.name) by = change.user.name;
                  else if (change.user.firstName) by = `${change.user.firstName} ${change.user.lastName || ""}`.trim();
                  else by = change.user.id || change.user.name || t("table.system");
                } else {
                  const id = change.userId || change.user || change.createdBy;
                  if (id && userMap[id]) {
                    const u = userMap[id];
                    by = u?.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u?.name || u?.email || id;
                  } else if (id) {
                    by = id;
                  }
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
