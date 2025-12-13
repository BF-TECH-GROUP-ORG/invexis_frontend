"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Download, Filter, TrendingUp, DollarSign, Package, AlertTriangle } from "lucide-react";
import {
  fetchInventorySummary,
  fetchABCAnalysis,
  fetchAgingInventory,
  fetchStockMovement
} from "@/features/reports/reportsSlice";
import ReportCard from "./ReportCard";
import InventoryChart from "./InventoryChart";
import ABCAnalysisChart from "./ABCAnalysisChart";
import StockMovementChart from "./StockMovementChart";
import AgingInventoryTable from "./AgingInventoryTable";
import DateRangeFilter from "./DateRangeFilter";
import ExportReportModal from "./ExportReportModal";
import { motion } from "framer-motion";

export default function ReportsDashboard() {
  const dispatch = useDispatch();
  const { inventorySummary, abcAnalysis, agingInventory, stockMovement, loading } = useSelector(
    (state) => state.reports
  );

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchInventorySummary());
    dispatch(fetchABCAnalysis());
    dispatch(fetchAgingInventory());
    dispatch(fetchStockMovement(dateRange));
  }, [dispatch, dateRange]);

  const summaryStats = [
    {
      title: "Total Products",
      value: inventorySummary?.totalProducts || 0,
      change: "+12.5%",
      changeType: "increase",
      icon: <Package className="text-blue-500" size={28} />,
      bgColor: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Total Value",
      value: `$${(inventorySummary?.totalValue || 0).toLocaleString()}`,
      change: "+8.3%",
      changeType: "increase",
      icon: <DollarSign className="text-green-500" size={28} />,
      bgColor: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Stock Turnover",
      value: `${(inventorySummary?.turnoverRate || 0).toFixed(1)}x`,
      change: "+5.2%",
      changeType: "increase",
      icon: <TrendingUp className="text-purple-500" size={28} />,
      bgColor: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      title: "Low Stock Items",
      value: inventorySummary?.lowStockCount || 0,
      change: "-3.1%",
      changeType: "decrease",
      icon: <AlertTriangle className="text-orange-500" size={28} />,
      bgColor: "bg-orange-50",
      color: "text-orange-600",
    },
  ];

  const handleExport = (format) => {
    // Export logic here
    console.log(`Exporting in ${format} format`);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive inventory insights and performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter size={18} />
              Filters
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />
          </motion.div>
        )}
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryStats.map((stat, index) => (
          <ReportCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inventory Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Inventory Trends</h2>
            <select className="px-3 py-1 border rounded-lg text-sm">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last Year</option>
            </select>
          </div>
          <InventoryChart data={stockMovement} />
        </div>

        {/* ABC Analysis Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">ABC Analysis</h2>
            <span className="text-xs text-gray-500">Product Classification</span>
          </div>
          <ABCAnalysisChart data={abcAnalysis} />
        </div>
      </div>

      {/* Stock Movement Chart - Full Width */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Stock Movement</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">In</button>
            <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg">Out</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">Net</button>
          </div>
        </div>
        <StockMovementChart data={stockMovement} dateRange={dateRange} />
      </div>

      {/* Aging Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Aging Inventory</h2>
          <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            View All
          </button>
        </div>
        <AgingInventoryTable data={agingInventory} />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}