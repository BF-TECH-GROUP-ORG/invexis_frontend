"use client";
import { FolderOpen, History, Layers } from "lucide-react";

export default function YearGrid({ years, onSelectYear }) {
    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                        <History size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#081422] tracking-tight">Timeline Archive</h2>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Historical record repositories</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <Layers size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{years.length} Fiscal Periods</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {years.map((year, idx) => (
                    <button
                        key={year}
                        onClick={() => onSelectYear(year)}
                        style={{ animationDelay: `${idx * 75}ms` }}
                        className="group relative flex flex-col items-center p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-12px_rgba(255,120,45,0.12)] transition-all duration-700 hover:-translate-y-3 overflow-hidden"
                    >
                        {/* Premium Brand Bar Decoration */}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-50 group-hover:bg-[#ff782d] transition-colors duration-500" />

                        {/* Decorative Top Glow */}
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-orange-400/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Refined Icon Container */}
                        <div className="relative w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-[#081422] group-hover:rotate-12 transition-all duration-500 border border-slate-100 group-hover:scale-110 shadow-sm">
                            <FolderOpen
                                size={32}
                                strokeWidth={1.5}
                                className="text-orange-500 group-hover:text-white transition-all duration-500"
                            />
                        </div>

                        <div className="text-center relative z-10">
                            <span className="block text-2xl font-black text-[#081422] tracking-tighter group-hover:text-orange-600 transition-colors">
                                {year}
                            </span>
                            <div className="flex items-center justify-center gap-2 mt-3 group-hover:opacity-100 transition-all duration-500">
                                <span className="text-[9px] text-slate-400 group-hover:text-orange-500 font-extrabold uppercase tracking-[0.2em]">Open Archive</span>
                            </div>
                        </div>

                        {/* Interactive Corner Accent */}
                        <div className="absolute bottom-6 right-6 w-3 h-3 bg-slate-100 rounded-full group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );
}
