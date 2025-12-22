// src/components/inventory/stock/StockHistoryTable.jsx
"use client";

import React, { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  RefreshCw,
  Search,
} from "lucide-react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Skeleton from "@mui/material/Skeleton";
import { getAllStockChanges } from "@/services/stockService";
import { useQuery } from "@tanstack/react-query";

export default function StockHistoryTable({ companyId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use React Query for data fetching
  const {
    data: result,
    isLoading: loading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["stock-changes", { page: page + 1, limit: rowsPerPage, companyId }],
    queryFn: () => getAllStockChanges({
      page: page + 1,
      limit: rowsPerPage,
      companyId,
    }),
    keepPreviousData: true,
    enabled: !!companyId, // Only fetch if companyId is available
  });

  const changes = result?.data || result || [];
  const total = result?.pagination?.total || result?.length || 0;

  const filteredChanges = changes.filter((change) => {
    const matchesSearch =
      searchTerm === "" ||
      (change.product?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (change.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === "all" || change.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <History size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Stock History
            </h3>
            <p className="text-sm text-gray-500">
              View all stock changes and adjustments
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
            >
              <option value="all">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>

            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>


      {/* Table */}
      {loading ? (
        <div className="p-0">
          <Table size="small">
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold text-gray-700">Type</TableCell>
                <TableCell className="font-semibold text-gray-700">Product</TableCell>
                <TableCell className="font-semibold text-gray-700">SKU</TableCell>
                <TableCell align="center" className="font-semibold text-gray-700">Quantity</TableCell>
                <TableCell className="font-semibold text-gray-700">Reason</TableCell>
                <TableCell className="font-semibold text-gray-700">Date</TableCell>
                <TableCell className="font-semibold text-gray-700">By</TableCell>
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
          <p className="text-red-500">{error.message || "Failed to load stock history"}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-orange-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filteredChanges.length === 0 ? (
        <div className="p-12 text-center">
          <History size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No stock changes found</p>
        </div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold text-gray-700">
                  Type
                </TableCell>
                <TableCell className="font-semibold text-gray-700">
                  Product
                </TableCell>
                <TableCell className="font-semibold text-gray-700">
                  SKU
                </TableCell>
                <TableCell
                  align="center"
                  className="font-semibold text-gray-700"
                >
                  Quantity
                </TableCell>
                <TableCell className="font-semibold text-gray-700">
                  Reason
                </TableCell>
                <TableCell className="font-semibold text-gray-700">
                  Date
                </TableCell>
                <TableCell className="font-semibold text-gray-700">
                  By
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChanges.map((change, index) => (
                <TableRow key={change._id || index} hover>
                  <TableCell>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${change.type === "in"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {change.type === "in" ? (
                        <ArrowDownCircle size={14} />
                      ) : (
                        <ArrowUpCircle size={14} />
                      )}
                      {change.type === "in" ? "Stock In" : "Stock Out"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {change.product?.name || change.productName || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 font-mono text-sm">
                      {change.sku || change.product?.sku || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <span
                      className={`font-semibold ${change.type === "in" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {change.type === "in" ? "+" : "-"}
                      {change.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {change.reason || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-500 text-sm">
                      {formatDate(change.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {change.user?.name || change.createdBy || "System"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-2 flex justify-end border-t border-gray-100">
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
