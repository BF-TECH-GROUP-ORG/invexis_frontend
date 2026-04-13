"use client";
import { FolderOpen, History, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * YearGrid - Premium Timeline Repository Shell
 * Uses glassmorphism and refined brand tokens
 */
export default function YearGrid({ years, onSelectYear }) {
    return (
        <div className="p-4 sm:p-12 max-w-[1700px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 px-4">
                <div className="space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <History size={12} />
                        Document Timeline
                    </motion.div>
                    <div>
                        <h2 className="text-4xl font-extrabold text-[#081422] tracking-tight leading-tight">
                            Fiscal <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-orange-400">Archives</span>
                        </h2>
                        <p className="text-sm text-slate-400 font-medium max-w-md mt-2">
                            Access historical company records and data repositories organized by fiscal year.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                    <Layers size={16} className="text-orange-500" />
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-[#081422] leading-none">{years.length}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Repositories</span>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {years.map((year, idx) => (
                    <motion.button
                        key={year}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => onSelectYear(year)}
                        className="group relative flex flex-col items-center p-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-12px_rgba(255,120,45,0.15)] transition-all duration-500 hover:bg-white/80"
                    >
                        {/* Premium Soft Glow */}
                        <div className="absolute inset-0 bg-linear-to-br from-orange-400/0 via-transparent to-orange-400/0 group-hover:from-orange-400/5 group-hover:to-orange-400/5 rounded-[3rem] transition-all duration-500" />
                        
                        {/* Static Subtle Border Glow */}
                        <div className="absolute inset-0 rounded-[3rem] border border-transparent group-hover:border-orange-200/50 transition-all duration-500" />

                        {/* Icon Strategy */}
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-slate-50/50 rounded-4xl flex items-center justify-center border border-white group-hover:bg-[#081422] group-hover:scale-110 transition-all duration-700 shadow-sm">
                                <FolderOpen
                                    size={40}
                                    strokeWidth={1.25}
                                    className="text-orange-500 group-hover:text-white transition-all duration-700"
                                />
                            </div>
                            
                            {/* Small Float Indicator */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-50 rounded-full flex items-center justify-center shadow-lg group-hover:bg-orange-500 transition-colors duration-500">
                                <ArrowRight size={14} className="text-slate-300 group-hover:text-white" />
                            </div>
                        </div>

                        <div className="text-center relative z-10 w-full">
                            <span className="block text-4xl font-black text-[#081422] tracking-tighter group-hover:scale-105 transition-transform duration-500">
                                {year}
                            </span>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100/50 flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-orange-500 uppercase tracking-[0.25em]">Explore Archive</span>
                                <div className="mt-1 w-8 h-[2px] bg-slate-100 group-hover:w-16 group-hover:bg-orange-500 transition-all duration-700" />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

