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
import { motion, AnimatePresence } from "framer-motion";

export default function MaterialReportTable({ branches = [], period = {} }) {
  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/20">
        <Package className="text-gray-200 mb-4" size={48} />
        <p className="text-gray-400 font-bold">No material records found for this period.</p>
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Branch Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white border border-gray-200 rounded-2xl">
            <MapPin className="text-[#081422]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#081422]">
              Branch: {branch.shopId}
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {branch.products.length} Material Items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Branch Value</p>
            <p className="text-sm font-black text-[#081422]">RWF {branch.totals.value.totalValue.toLocaleString()}</p>
          </div>
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
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Material Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Opening</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock In</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Out</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Value</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {branch.products.map((p) => (
                    <tr key={p.productId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#081422] group-hover:text-blue-600 transition-colors">{p.productName}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{p.categoryName}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-500">{p.stats.movement.open}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                          <ArrowUpRight size={14} />
                          {p.stats.movement.in}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-orange-500 font-black text-sm">
                          <ArrowDownRight size={14} />
                          {p.stats.movement.out}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-[#081422]">{p.stats.movement.close}</td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#081422]">RWF {p.stats.value.totalValue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-bold">@ {p.stats.value.unitPrice.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={p.stats.status.stockStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Branch Footer / KPI Footer */}
            <div className="p-6 bg-gray-50/30 flex flex-wrap gap-12 border-t border-gray-100">
               <KpiItem label="Total Stock" value={branch.totals.movement.close} />
               <KpiItem label="Inflow" value={branch.totals.movement.in} color="text-emerald-600" />
               <KpiItem label="Outflow" value={branch.totals.movement.out} color="text-orange-500" />
               <KpiItem label="Low Stock Items" value={branch.totals.kpis.lowStockItems} color="text-orange-600" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "In Stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Low Stock": "bg-orange-50 text-orange-600 border-orange-100",
    "Out of Stock": "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {status}
    </span>
  );
}

function KpiItem({ label, value, color = "text-[#081422]" }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}
