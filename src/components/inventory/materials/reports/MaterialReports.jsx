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
  const t = useTranslations("materials.reports");
  const commonT = useTranslations("common");
  
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
    toast.success(t("exportStarted"));
  }, [reportData, t]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#081422]"></div>
      <p className="text-gray-400 font-medium animate-pulse">{t("insights")}</p>
    </div>
  );

  const grandTotal = reportData?.grandTotal || { value: { totalValue: 0 }, kpis: { totalItems: 0, lowStockItems: 0 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#081422] flex items-center gap-3">
            <BarChart3 className="text-gray-900" size={28} />
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition font-bold text-sm ${isFilterOpen ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter size={16} />
            {t("advancedFilters")}
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#081422] text-white rounded-xl hover:bg-black transition font-bold text-sm"
          >
            <Download size={16} />
            {t("exportCsv")}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title={t("assetValue")} 
          value={`RWF ${grandTotal.value.totalValue.toLocaleString()}`} 
          icon={<TrendingUp size={24} />} 
          desc={t("valuationDesc")}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <SummaryCard 
          title={t("totalItems")} 
          value={grandTotal.kpis.totalItems} 
          icon={<Package size={24} />} 
          desc={t("branchDesc")}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <SummaryCard 
          title={t("lowStockAssets")} 
          value={grandTotal.kpis.lowStockItems} 
          icon={<AlertTriangle size={24} />} 
          desc={t("replenishDesc")}
          warning={grandTotal.kpis.lowStockItems > 0}
          color="#f59e0b"
          bgColor="#fef3c7"
        />
        <SummaryCard 
          title={t("stockMovement")} 
          value={grandTotal.movement?.in || 0} 
          icon={<RefreshCw size={24} />} 
          desc={t("movementDesc")}
          color="#8b5cf6"
          bgColor="#f3e8ff"
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
                  <Calendar size={14} /> {t("period")}
                </label>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none transition"
                >
                  <option value="daily">{commonT("filters.daily")}</option>
                  <option value="weekly">{commonT("filters.weekly")}</option>
                  <option value="monthly">{commonT("filters.monthly")}</option>
                  <option value="yearly">{commonT("filters.yearly")}</option>
                  <option value="custom">{commonT("filters.custom")}</option>
                </select>
              </div>

              {/* Custom Range */}
              {filter === "custom" && (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("startDate")}</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("endDate")}</label>
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
                  <MapPin size={14} /> {t("branch")}
                </label>
                <select 
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none transition"
                >
                  <option value="">{t("allBranches")}</option>
                  {shops.map(s => <option key={s._id} value={s._id}>{s.name || s.shopId}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Layers size={14} /> {t("materials.table.category")}
                </label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:border-black outline-none transition"
                >
                  <option value="">{t("allCategories")}</option>
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

function SummaryCard({ title, value, icon, desc, warning, color, bgColor }) {
  return (
    <div className={`p-5 border rounded-2xl bg-white transition-all border-gray-100 hover:border-[#081422] overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-sm text-[#6b7280] font-medium mb-1 truncate">{title}</div>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold font-jetbrains text-[#081422] transition-all ${value.toString().length > 12 ? "text-lg" : "text-2xl"}`}>
              {value}
            </h3>
            {warning && <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider truncate">{desc}</p>
        </div>
        <div 
          className="p-3 rounded-xl shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <div style={{ color: color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
