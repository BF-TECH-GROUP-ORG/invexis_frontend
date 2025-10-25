"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  FileDown,
  FileSpreadsheet,
  Printer,
  Search,
  AlertTriangle,
  Clock,
  X,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* ──────────────── SAMPLE DATA ──────────────── */
const salesData = [
  { name: "01 Jan", sales: 3000 },
  { name: "05 Jan", sales: 4000 },
  { name: "10 Jan", sales: 6000 },
  { name: "15 Jan", sales: 2000 },
  { name: "20 Jan", sales: 5000 },
  { name: "25 Jan", sales: 4500 },
  { name: "31 Jan", sales: 5500 },
];

const baseCategoryData = [
  { name: "Footwear", value: 40, color: "#6366f1" },
  { name: "Electronics", value: 35, color: "#f59e0b" },
  { name: "Fashion", value: 25, color: "#10b981" },
];

const baseActivities = [
  { id: 1, category: "Footwear", action: "Added 200 Units of Nike Air Max", time: "2h ago" },
  { id: 2, category: "Electronics", action: "Updated Product Prices", time: "Yesterday" },
  { id: 3, category: "Electronics", action: "Low stock warning: Bluetooth Speaker", time: "2 days ago" },
  { id: 4, category: "Fashion", action: "New seasonal handbags uploaded", time: "3 days ago" },
];

const initialProducts = [
  { id: 1, product: "Running Shoes H520", category: "Footwear", sales: "$440", stock: 25, status: "Available" },
  { id: 2, product: "Bluetooth Speaker", category: "Electronics", sales: "$240", stock: 10, status: "Low Stock" },
  { id: 3, product: "Handbag", category: "Fashion", sales: "$180", stock: 50, status: "Available" },
];

/* ──────────────── COMPONENT ──────────────── */
export default function ReportDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showWarning, setShowWarning] = useState(true);

  // Auto close warning after 1 min
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => setShowWarning(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch = p.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = filteredProducts.filter((p) => p.stock < 15);
  const filteredCategories =
    filterCategory === "All" ? baseCategoryData : baseCategoryData.filter((c) => c.name === filterCategory);
  const filteredActivities =
    filterCategory === "All" ? baseActivities : baseActivities.filter((a) => a.category === filterCategory);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Product", "Category", "Sales", "Stock", "Status"]],
      body: filteredProducts.map((p) => [p.product, p.category, p.sales, p.stock, p.status]),
    });
    doc.save("report.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#f9fafc] text-gray-800 px-1 sm:px-1 md:px-1 py-6 overflow-hidden">
      {/* ───────── HEADER ───────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-lg sm:text-2xl font-semibold">Report Dashboard</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={handleExportPDF} className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-blue-600 transition w-full sm:w-auto">
            <FileDown size={14} /> PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center justify-center gap-1 bg-green-500 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-green-600 transition w-full sm:w-auto">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={handlePrint} className="flex items-center justify-center gap-1 bg-gray-500 text-white px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-gray-600 transition w-full sm:w-auto">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* ───────── WARNING BANNER ───────── */}
      {showWarning && lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-yellow-800 p-3 mb-5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600 w-4 h-4 flex-shrink-0" />
            <span>
              {lowStockItems.length} product(s) are low on stock.{" "}
              <button className="underline text-blue-600 font-medium" onClick={() => setFilterCategory("Electronics")}>
                View details
              </button>
            </span>
          </div>
          <button onClick={() => setShowWarning(false)} className="text-gray-500 hover:text-gray-700 self-end sm:self-auto">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* ───────── SUMMARY CARDS ───────── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Revenue", value: "$205.25k", icon: <ShoppingBag className="text-purple-600" />, color: "purple", trend: "+4.5%" },
          { title: "Total Customers", value: "2,755", icon: <Users className="text-blue-600" />, color: "blue", trend: "+3.2%" },
          { title: "Total Products", value: "2058", icon: <Package className="text-yellow-600" />, color: "yellow", trend: "+4.1%" },
          { title: "Low Stock Items", value: lowStockItems.length.toString(), icon: <TrendingUp className="text-red-500" />, color: "red", trend: "-1.2%" },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">{card.title}</p>
                <h3 className="text-lg font-semibold">{card.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-${card.color}-100`}>{card.icon}</div>
            </div>
            <p className={`text-xs mt-1 ${card.trend.startsWith("-") ? "text-red-600" : "text-green-600"}`}>{card.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* ───────── CHARTS ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Line Chart */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm border lg:col-span-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-base font-semibold text-gray-700 mb-3">Sales Trend</h2>
          <div className="h-44 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-base font-semibold text-gray-700 mb-3">Category Distribution</h2>
          <div className="h-44 sm:h-56 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={filteredCategories} dataKey="value" nameKey="name" outerRadius={70}>
                  {filteredCategories.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ───────── ACTIVITY & QUICK STATS ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="font-semibold text-gray-700 mb-3">Recent Activities</h2>
          <div className="space-y-3 text-sm">
            {filteredActivities.map((a) => (
              <div key={a.id} className="flex gap-3">
                <Clock className="text-gray-400 w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">{a.action}</p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="font-semibold text-gray-700 mb-3">Quick Stats</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-indigo-500 w-4 h-4" />
              <p>Active Categories: <span className="font-medium">{filteredCategories.length}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-500 w-4 h-4" />
              <p>Low Stock %: <span className="font-medium">{((lowStockItems.length / initialProducts.length) * 100).toFixed(0)}%</span></p>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-purple-500 w-4 h-4" />
              <p>Average Sales: <span className="font-medium">$320</span></p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ───────── PRODUCT TABLE ───────── */}
      <motion.div
        className="bg-white rounded-xl p-4 shadow-sm border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:ring focus:ring-blue-100"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto border px-3 py-2 rounded-md text-sm outline-none focus:ring focus:ring-blue-100"
          >
            <option value="All">All Categories</option>
            <option value="Footwear">Footwear</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
          </select>
        </div>

        <h2 className="font-semibold text-gray-700 mb-3">Detailed Report</h2>
        <div className="overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm table-fixed">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 w-1/5">Product</th>
                <th className="py-2 w-1/5">Category</th>
                <th className="py-2 w-1/5">Sales</th>
                <th className="py-2 w-1/5">Stock</th>
                <th className="py-2 w-1/5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/inventory/products/${row.id}`)}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <td className="py-2">{row.product}</td>
                    <td>{row.category}</td>
                    <td>{row.sales}</td>
                    <td className={`${row.stock < 15 ? "text-red-500 font-medium" : ""}`}>{row.stock}</td>
                    <td className={`${row.status === "Low Stock" ? "text-red-500 font-medium" : "text-green-600 font-medium"}`}>
                      {row.status}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
