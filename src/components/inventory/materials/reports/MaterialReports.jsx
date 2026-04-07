"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { 
  Download, 
  Filter, 
  Calendar, 
  ChevronDown, 
  Search, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  MapPin,
  Layers
} from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import MaterialReportTable from "./MaterialReportTable";
import { getCategories } from "@/services/categoriesService";
import { getShops } from "@/services/branches"; // Assuming this exists or using organizationService

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function MaterialReports() {
  const { data: session } = useSession();
  const t = useTranslations("products");
  
  // Filters State
  const [filter, setFilter] = useState("daily");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [shopId, setShopId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const companyId = session?.user?.companies?.[0];
  const accessToken = session?.accessToken;

  // Fetch Report Data
  const { data: reportData, isLoading, isError, refetch } = useQuery({
    queryKey: ["material-report", { companyId, filter, startDate, endDate, shopId, categoryId }],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/inventory/v1/reports`, {
        params: {
          companyId,
          filter,
          startDate: filter === 'custom' ? startDate : undefined,
          endDate: filter === 'custom' ? endDate : undefined,
          shopId: shopId || undefined,
          isForSale: "false", // Critical
        },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return data.data;
    },
    enabled: !!companyId && !!accessToken,
  });

  // Fetch Categories & Shops for filters
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", { companyId }],
    queryFn: async () => {
       const { data } = await axios.get(`${API_BASE}/inventory/v1/categories`, {
         params: { companyId },
         headers: { Authorization: `Bearer ${accessToken}` }
       });
       return data.data || [];
    },
    enabled: !!companyId && !!accessToken,
  });

  const { data: shopsResponse } = useQuery({
    queryKey: ["shops", { companyId }],
    queryFn: async () => {
       const { data } = await axios.get(`${API_BASE}/shop/v1/shops`, {
         params: { companyId },
         headers: { Authorization: `Bearer ${accessToken}` }
       });
       return data.data || [];
    },
    enabled: !!companyId && !!accessToken,
  });

  const categories = categoriesResponse || [];
  const shops = shopsResponse || [];

  // Export Logic (CSV)
  const handleExport = useCallback(() => {
    if (!reportData || !reportData.branches) return;
    
    const rows = [
      ["Material Name", "Category", "Branch", "Opening Stock", "Stock In", "Stock Out", "Closing Stock", "Unit Cost", "Total Value", "Status"]
    ];

    reportData.branches.forEach(branch => {
      branch.products.forEach(p => {
        rows.push([
          p.productName,
          p.categoryName,
          branch.shopId, // Or branch name if available
          p.stats.movement.open,
          p.stats.movement.in,
          p.stats.movement.out,
          p.stats.movement.close,
          p.stats.value.unitPrice,
          p.stats.value.totalValue,
          p.stats.status.stockStatus
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `material_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export started");
  }, [reportData]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#081422]"></div>
      <p className="text-gray-400 font-medium animate-pulse">Generating Material Insights...</p>
    </div>
  );

  const grandTotal = reportData?.grandTotal || { value: { totalValue: 0 }, kpis: { totalItems: 0, lowStockItems: 0 } };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#081422] flex items-center gap-3">
            <BarChart3 className="text-gray-900" size={32} />
            Material Stock Reports
          </h1>
          <p className="text-gray-500 font-medium mt-1">Deep insights into internal assets, valuation and movement trends</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition font-bold text-sm ${isFilterOpen ? "border-black bg-black text-white" : "border-gray-100 bg-white text-gray-700 hover:border-gray-300"}`}
          >
            <Filter size={18} />
            Advanced Filters
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#081422] text-white rounded-xl hover:bg-black transition font-bold text-sm shadow-xl shadow-gray-200"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Asset Value" 
          value={`RWF ${grandTotal.value.totalValue.toLocaleString()}`} 
          icon={<TrendingUp className="text-emerald-500" />} 
          desc="Current valuation"
        />
        <SummaryCard 
          title="Total Items" 
          value={grandTotal.kpis.totalItems} 
          icon={<Package className="text-blue-500" />} 
          desc="Across all branches"
        />
        <SummaryCard 
          title="Low Stock Assets" 
          value={grandTotal.kpis.lowStockItems} 
          icon={<AlertTriangle className="text-orange-500" />} 
          desc="Requires replenishment"
          warning={grandTotal.kpis.lowStockItems > 0}
        />
        <SummaryCard 
          title="Stock Movement" 
          value={grandTotal.movement?.in || 0} 
          icon={<RefreshCw className="text-purple-500" />} 
          desc="Total restocks (In)"
        />
      </div>

      {/* Filters Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Period */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Calendar size={14} /> Reporting Period
                </label>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none transition"
                >
                  <option value="daily">Today (Daily)</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Range */}
              {filter === "custom" && (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none"
                    />
                  </div>
                </>
              )}

              {/* Shop/Branch */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <MapPin size={14} /> Branch / Shop
                </label>
                <select 
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none transition"
                >
                  <option value="">All Branches</option>
                  {shops.map(s => <option key={s._id} value={s._id}>{s.name || s.shopId}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Layers size={14} /> Category
                </label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none transition"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Content */}
      <div className="bg-white">
        <MaterialReportTable 
          branches={reportData?.branches || []} 
          period={reportData?.period}
        />
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, desc, warning }) {
  return (
    <div className={`p-6 border rounded-3xl bg-white transition-all ${warning ? "border-orange-200 bg-orange-50/20" : "border-gray-100 hover:border-black hover:shadow-xl hover:shadow-gray-100"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-black transition-colors">{icon}</div>
        {warning && <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#081422]">{value}</h3>
        <p className="text-xs text-gray-500 mt-2 font-medium">{desc}</p>
      </div>
    </div>
  );
}
