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
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getCategories } from "@/services/categoriesService";
import axios from "axios";
import { getCompanyAssetReport } from "@/services/organizationService";
import { getShops } from "@/services/branches";
import apiClient from "@/lib/apiClient";
import MaterialReportTable from "./MaterialReportTable";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

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
      const resp = await getCompanyAssetReport(companyId, {
        filter,
        startDate: filter === 'custom' ? startDate : undefined,
        endDate: filter === 'custom' ? endDate : undefined,
        shopId: shopId || undefined,
        categoryId: categoryId || undefined,
      });
      return resp.data;
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

  const handleExport = useCallback(() => {
    if (!reportData?.branches?.length) {
      toast.error(t("noRecords") || "No records to export");
      return;
    }

    const doc = new jsPDF();
    
    // Header Styling
    doc.setFontSize(22);
    doc.setTextColor(8, 20, 34);
    doc.text("Asset Management Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Company Assets Inventory - ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 36);
    
    let currentY = 45;
    
    reportData.branches.forEach((branch, index) => {
      if (index > 0 && currentY > 180) {
        doc.addPage();
        currentY = 20;
      } else if (index > 0) {
        currentY += 10;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text(`Branch: ${branch.shopName || branch.shopId}`, 14, currentY);
      currentY += 6;
      
      const tableRows = (branch.products || []).map(p => [
        p.productName || 'Unknown',
        p.stats?.movement?.open || 0,
        p.stats?.movement?.in || 0,
        p.stats?.movement?.out || 0,
        p.stats?.movement?.close || 0,
        p.stats?.status?.stockStatus || 'Unknown'
      ]);
      
      doc.autoTable({
        startY: currentY,
        head: [['Asset', 'Opening', 'In', 'Out', 'Final', 'Status']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [8, 20, 34], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      
      currentY = doc.lastAutoTable.finalY + 8;
      
      // Subtotals
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Branch Summary: ${branch.totals?.movement?.close || 0} Total | ${branch.totals?.movement?.in || 0} In | ${branch.totals?.movement?.out || 0} Out`, 14, currentY);
      currentY += 15;
    });
    
    doc.save(`invexis_asset_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success(t("exportPdfStarted") || "PDF Export Started");
  }, [reportData, startDate, endDate, t]);



  const grandTotal = reportData?.grandTotal || { value: { totalValue: 0 }, kpis: { totalItems: 0, lowStockItems: 0 } };

  const totalItemsTrend = useMemo(() => {
    if (!reportData?.branches) return null;
    const allProducts = reportData.branches.flatMap(b => b.products || []);
    if (allProducts.length === 0) return null;
    // Distribution: sort items by close stock descending
    const vals = allProducts.map(p => p.stats?.movement?.close || 0).sort((a, b) => b - a);
    return vals.map(v => ({ val: v }));
  }, [reportData]);

  const lowStockTrend = useMemo(() => {
    if (!reportData?.branches) return null;
    const allProducts = reportData.branches.flatMap(b => b.products || []);
    const lowStockVals = allProducts
      .filter(p => p.stats?.status?.stockStatus === "Low Stock" || p.stats?.status?.stockStatus === "Out of Stock" || p.stats?.movement?.close <= 5)
      .map(p => p.stats?.movement?.close || 0)
      .sort((a, b) => a - b); // Ascending for low stock urgency
    if (lowStockVals.length === 0) return [{ val: 0 }, { val: 0 }, { val: 0 }];
    return lowStockVals.map(v => ({ val: v }));
  }, [reportData]);

  const movementTrend = useMemo(() => {
    if (!reportData?.branches) return null;
    const allProducts = reportData.branches.flatMap(b => b.products || []);
    if (allProducts.length === 0) return null;
    // Distribution: sort by movement in descending
    const vals = allProducts.map(p => p.stats?.movement?.in || 0).sort((a, b) => b - a);
    return vals.map(v => ({ val: v }));
  }, [reportData]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#081422]"></div>
      <p className="text-gray-400 font-medium animate-pulse">{t("insights")}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard 
          title={t("totalItems")} 
          value={grandTotal.kpis?.totalItems || 0} 
          icon={<Package size={24} />} 
          desc={t("branchDesc")}
          color="#3b82f6"
          bgColor="#eff6ff"
          trendData={totalItemsTrend}
        />
        <SummaryCard 
          title={t("lowStockAssets")} 
          value={grandTotal.kpis?.lowStockItems || 0} 
          icon={<AlertTriangle size={24} />} 
          desc={t("replenishDesc")}
          warning={grandTotal.kpis?.lowStockItems > 0}
          color="#f59e0b"
          bgColor="#fef3c7"
          trendData={lowStockTrend}
        />
        <SummaryCard 
          title={t("stockMovement")} 
          value={grandTotal.movement?.in || 0} 
          icon={<RefreshCw size={24} />} 
          desc={t("movementDesc")}
          color="black"
          bgColor="#f3e8ff"
          trendData={movementTrend}
        />
      </div>

      <div className="flex justify-between">
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
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition font-bold text-sm ${isFilterOpen ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter size={16} />
            {t("advancedFilters")}
          </button>
          
          <button 
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#081422] text-white rounded-xl hover:bg-black transition font-bold text-sm"
          >
            <Download size={16} />
            {t("exportPdf") || "Export PDF"}
          </button>
        </div>
      </div>
        
          

      {/* Filters Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6"
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

function SummaryCard({ title, value, icon, desc, warning, color, bgColor, trendData }) {
  const data = useMemo(() => {
    if (trendData) return trendData;
    const base = [20, 35, 25, 45, 30, 60, 45, 80, 55];
    return base.map((v, i) => ({ val: v + (i % 2 === 0 ? 10 : -5) + Math.random() * 5 }));
  }, [trendData]);

  const gradientId = `color-${title?.toString().replace(/[^a-zA-Z0-9]/g, '') || color.replace('#', '')}`;

  return (
    <div className="border-2 border-[#e5e7eb] rounded-2xl bg-white hover:border-[#ff782d] transition-colors hover:shadow-lg group w-full overflow-hidden relative min-h-[140px]">
      <div className="p-5 flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm text-[#6b7280] font-semibold mb-1 uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className={`font-extrabold font-jetbrains text-[#111827] transition-all ${value?.toString().length > 12 ? "text-xl" : "text-3xl"}`}>
              {value}
            </h3>
            {warning && <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff782d] animate-pulse"></span>}
          </div>
          <p className="text-[10px] text-[#9ca3af] mt-4 font-bold uppercase tracking-wider truncate">{desc}</p>
        </div>
        <div 
          className="p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 bg-white shadow-sm"
          style={{ backgroundColor: bgColor }}
        >
          <div style={{ color: color }}>{icon}</div>
        </div>
      </div>
      
      {/* Background Sparkline */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="val" stroke={color} fillOpacity={1} fill={`url(#${gradientId})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

