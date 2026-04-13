"use client";
import { useSelector } from "react-redux";
import { selectDocumentStats } from "@/features/documents/documentsSlice";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Wallet, ShieldCheck } from "lucide-react";

/**
 * Statistics - Premium Glassmorphic Insights
 */
export default function Statistics() {
    const stats = useSelector(selectDocumentStats);

    const StatCard = ({ label, value, subtext, icon: Icon, color, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8 }}
            className="group relative flex flex-col justify-between p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl shadow-[0_15px_35px_rgba(0,0,0,0.02)] transition-all duration-500 hover:bg-white/70 hover:-translate-y-2"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-50 transition-all duration-500 group-hover:bg-[#081422] group-hover:text-white group-hover:scale-110`}>
                    <Icon size={24} strokeWidth={1.5} className={color} />
                </div>
                {subtext && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{subtext}</span>}
            </div>

            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-[#081422] tracking-tight">{value}</h3>
                </div>
            </div>

            {/* Subtle Gradient Hint */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500/30 transition-all duration-700 rounded-b-4xl" />
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
                label="Total Records"
                value={stats.total}
                subtext={`${stats.thisMonth} NEW`}
                icon={FileText}
                color="text-blue-500"
                delay={0.1}
            />
            <StatCard
                label="Aggregate Value"
                value={`$${(stats.totalAmount / 1000).toFixed(1)}K`}
                subtext="TOTAL"
                icon={TrendingUp}
                color="text-orange-500"
                delay={0.2}
            />
            <StatCard
                label="Financial Assets"
                value={stats.financial}
                subtext={`${stats.total > 0 ? ((stats.financial / stats.total) * 100).toFixed(0) : 0}%`}
                icon={Wallet}
                color="text-emerald-500"
                delay={0.3}
            />
            <StatCard
                label="Verified Records"
                value={stats.archived}
                subtext="SECURE"
                icon={ShieldCheck}
                color="text-indigo-500"
                delay={0.4}
            />
        </div>
    );
}