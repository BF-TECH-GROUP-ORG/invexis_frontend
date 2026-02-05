"use client";
import { ArrowLeft, Calendar, Lock, ChevronRight } from "lucide-react";

export default function MonthGrid({ year, availableMonths, onSelectMonth, onBack }) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-right-4 duration-1000">
            {/* Elegant Header */}
            <div className="flex items-center gap-8 mb-16 px-2">
                <button
                    onClick={onBack}
                    className="p-3 bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50 rounded-2xl text-slate-400 hover:text-orange-600 transition-all duration-300 shadow-sm"
                >
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-[#081422] tracking-tight">{year} Archive</h2>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1">Select a monthly checkpoint to view records</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {months.map((month, index) => {
                    const isAvailable = availableMonths.includes(index + 1);
                    return (
                        <button
                            key={month}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && onSelectMonth(index + 1)}
                            className={`group relative p-8 border rounded-[2.5rem] transition-all duration-700 text-left ${isAvailable
                                ? "bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-12px_rgba(255,120,45,0.12)] cursor-pointer hover:-translate-y-3"
                                : "bg-slate-50 border-slate-50 opacity-40 cursor-not-allowed"
                                } overflow-hidden`}
                        >
                            {/* Premium Brand Bar */}
                            <div className={`absolute top-0 left-0 w-full h-[3px] transition-colors duration-500 ${isAvailable ? 'bg-slate-100 group-hover:bg-[#ff782d]' : 'bg-slate-200'}`} />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isAvailable ? 'bg-slate-50 border-slate-100 text-[#ff782d] group-hover:bg-[#081422] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-sm' : 'bg-slate-100 border-transparent text-slate-300'}`}>
                                    <Calendar size={24} strokeWidth={2} />
                                </div>
                                {isAvailable && (
                                    <div className="p-2 bg-orange-50 text-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100">
                                        <ChevronRight size={14} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 relative z-10">
                                <span className={`text-xl font-bold block tracking-tighter transition-colors ${isAvailable ? "text-[#081422] group-hover:text-orange-600" : "text-slate-400"}`}>
                                    {month}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isAvailable ? 'text-slate-400' : 'text-slate-300'}`}>
                                        {isAvailable ? 'Records Online' : 'No Data Indexed'}
                                    </span>
                                </div>
                            </div>

                            {!isAvailable && (
                                <div className="absolute top-5 right-5">
                                    <Lock size={14} className="text-slate-200" />
                                </div>
                            )}

                            {/* Corner Decorative Accent */}
                            <div className={`absolute bottom-8 right-8 w-2 h-2 rounded-full transition-all duration-500 ${isAvailable ? 'bg-slate-100 group-hover:bg-orange-500 group-hover:scale-150' : 'bg-transparent'}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
