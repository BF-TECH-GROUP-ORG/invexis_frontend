"use client";

import { useState } from "react";
import { 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  Package, 
  MapPin, 
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export default function MaterialReportTable({ branches = [], period = {} }) {
  const t = useTranslations("materials.reports");
  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/20">
        <Package className="text-gray-200 mb-4" size={48} />
        <p className="text-gray-400 font-bold">{t("noRecords")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {branches.map((branch, idx) => (
        <BranchReportSection key={branch.shopId || idx} branch={branch} />
      ))}
    </div>
  );
}

function BranchReportSection({ branch }) {
  const t = useTranslations("materials.reports");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Branch Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 bg-white cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="text-gray-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#081422]">
              {t("branch")}: {branch.shopId}
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {t("materialItems", { count: branch.products.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <ChevronDown className="text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Product List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfcff] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3">{t("materialInfo")}</th>
                    <th className="px-5 py-3">{t("opening")}</th>
                    <th className="px-5 py-3">{t("stockIn")}</th>
                    <th className="px-5 py-3">{t("stockOut")}</th>
                    <th className="px-5 py-3">{t("available")}</th>
                    <th className="px-5 py-3 text-center">{useTranslations("materials.table")("status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {branch.products.map((p) => (
                    <tr key={p.productId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <p className="text-sm font-bold text-gray-900">{p.productName}</p>
                        <p className="text-[10px] text-gray-400 font-bold tracking-tight">{p.categoryName}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{p.stats.movement.open}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <ArrowUpRight size={14} />
                          {p.stats.movement.in}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                          <ArrowDownRight size={14} />
                          {p.stats.movement.out}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-gray-900">{p.stats.movement.close}</td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={p.stats.status.stockStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Branch Footer / KPI Footer - Aligned with columns */}
            <div className="bg-gray-50/50 border-t border-gray-100">
               <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_100px] items-center px-5 py-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("branchTotals") || "Branch Totals"}</div>
                  <div className="text-sm font-bold text-gray-900 text-center">-</div>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                    <ArrowUpRight size={14} />
                    {branch.totals.movement.in}
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                    <ArrowDownRight size={14} />
                    {branch.totals.movement.out}
                  </div>
                  <div className="text-sm font-bold text-[#081422]">
                    {branch.totals.movement.close}
                  </div>
                  <div className="text-center">
                    {branch.totals.kpis.lowStockItems > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-[9px] font-bold uppercase">
                        {branch.totals.kpis.lowStockItems} {t("lowStock") || "Low"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">{t("allHealthy") || "Healthy"}</span>
                    )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }) {
  const t = useTranslations("materials.table");
  const styles = {
    "In Stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Low Stock": "bg-orange-50 text-orange-600 border-orange-100",
    "Out of Stock": "bg-red-50 text-red-600 border-red-100",
  };

  const statusMap = {
    "In Stock": t("inStock"),
    "Low Stock": t("lowStock"),
    "Out of Stock": t("outOfStock"),
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {statusMap[status] || status}
    </span>
  );
}

function KpiItem({ label, value, color = "text-[#081422]" }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
