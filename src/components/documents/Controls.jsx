"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearch,
  setFilterStatus,
  setFilterType,
  setFilterPriority,
  setFilterCategory,
  setDateRange,
  setViewMode,
  deleteDocument,
  bulkUpdateStatus,
  resetFilters,
  exportDocuments,
  selectCategories,
} from "@/Data/dataSlice";

export default function Controls({ onAddNew }) {
  const dispatch = useDispatch();
  const {
    search,
    filterStatus,
    filterType,
    filterPriority,
    filterCategory,
    dateRange,
    selected,
    viewMode,
    exportLoading,
  } = useSelector((s) => s.documents);

  const categories = useSelector(selectCategories);

  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Delete ${selected.length} document(s)?`)) {
      dispatch(deleteDocument(selected));
    }
    setShowBulkMenu(false);
  };

  const handleBulkStatusChange = (status) => {
    dispatch(bulkUpdateStatus({ ids: selected, status }));
    setShowBulkMenu(false);
  };

  const handleExport = (format) => {
    dispatch(
      exportDocuments({
        format,
        filters: { search, filterStatus, filterType, filterPriority, filterCategory, dateRange },
      })
    ).then((result) => {
      if (result.payload) {
        const url = window.URL.createObjectURL(new Blob([result.payload]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `documents-export.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    });
    setShowExportMenu(false);
  };

  const hasActiveFilters =
    filterStatus !== "All" ||
    filterType !== "All" ||
    filterPriority !== "All" ||
    filterCategory !== "All" ||
    dateRange.start ||
    dateRange.end ||
    search;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Main Controls Row */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
        {/* Left Side - Search & Filters */}
        <div className="flex gap-2 items-center flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search documents..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${
              hasActiveFilters
                ? "bg-orange-50 border-orange-500 text-orange-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Right Side - Actions */}
        <div className="flex gap-2 items-center flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => dispatch(setViewMode("table"))}
              className={`px-3 py-2 ${
                viewMode === "table" ? "bg-orange-500 text-white" : "bg-white hover:bg-gray-50"
              }`}
              title="Table View"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => dispatch(setViewMode("grid"))}
              className={`px-3 py-2 ${
                viewMode === "grid" ? "bg-orange-500 text-white" : "bg-white hover:bg-gray-50"
              }`}
              title="Grid View"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exportLoading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                </>
              )}
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm rounded-t-md"
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={() => handleExport("xlsx")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  📈 Export as Excel
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm rounded-b-md"
                >
                  📄 Export as PDF
                </button>
              </div>
            )}
          </div>

          {/* Bulk Actions (when items selected) */}
          {selected.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
                Actions ({selected.length})
              </button>

              {showBulkMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => handleBulkStatusChange("Financial")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Mark as Financial
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("Workshop")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    Mark as Workshop
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("Archived")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                    Archive
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Add New Button */
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Document
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t pt-4 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => dispatch(setFilterStatus(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Statuses</option>
                <option value="Financial">Financial</option>
                <option value="Workshop">Workshop</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => dispatch(setFilterType(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Types</option>
                <option value="Invoice">Invoice</option>
                <option value="Agreement">Agreement</option>
                <option value="Policy">Policy</option>
                <option value="Report">Report</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => dispatch(setFilterPriority(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => dispatch(setFilterCategory(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={() => dispatch(resetFilters())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateRange.start || ""}
                onChange={(e) =>
                  dispatch(setDateRange({ ...dateRange, start: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateRange.end || ""}
                onChange={(e) => dispatch(setDateRange({ ...dateRange, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
