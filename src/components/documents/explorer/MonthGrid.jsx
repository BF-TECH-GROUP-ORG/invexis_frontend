"use client";
import { ArrowLeft, Calendar, Lock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * MonthGrid - Premium Monthly Repository View
 */
export default function MonthGrid({ year, availableMonths, onSelectMonth, onBack }) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="p-4 sm:p-12 max-w-[1700px] mx-auto">
            {/* Header / Navigation Section */}
            <div className="flex items-center gap-8 mb-16 px-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="p-4 bg-white/70 backdrop-blur-md border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-200 rounded-2xl shadow-sm transition-all duration-300"
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div className="space-y-1">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]"
                    >
                        Fiscal Timeline
                    </motion.div>
                    <h2 className="text-4xl font-extrabold text-[#081422] tracking-tight">
                        Year <span className="text-orange-500">{year}</span>
                    </h2>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {months.map((month, index) => {
                    const isAvailable = availableMonths.includes(index + 1);
                    return (
                        <motion.button
                            key={month}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && onSelectMonth(index + 1)}
                            className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden ${isAvailable
                                ? "bg-white/40 backdrop-blur-xl border-white/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-12px_rgba(255,120,45,0.12)] hover:bg-white/90"
                                : "bg-slate-50/50 border-slate-100/50 opacity-40 cursor-not-allowed"
                            }`}
                        >
                            {/* Status Accent Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors duration-500 ${isAvailable ? 'bg-slate-100 group-hover:bg-orange-500' : 'bg-slate-200'}`} />

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isAvailable 
                                    ? 'bg-slate-50 border-slate-100 text-[#ff782d] group-hover:bg-[#081422] group-hover:text-white shadow-sm' 
                                    : 'bg-slate-100 border-transparent text-slate-300'}`}>
                                    <Calendar size={24} strokeWidth={1.5} />
                                </div>
                                {isAvailable && (
                                    <div className="p-2 bg-orange-50 text-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100">
                                        <ChevronRight size={14} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 relative z-10">
                                <span className={`text-xl font-black block tracking-tight transition-colors ${isAvailable ? "text-[#081422] group-hover:text-orange-600" : "text-slate-400"}`}>
                                    {month}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${isAvailable ? 'text-slate-400 font-extrabold' : 'text-slate-300'}`}>
                                        {isAvailable ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            {!isAvailable && (
                                <div className="absolute top-6 right-6 opacity-30">
                                    <Lock size={16} className="text-slate-400" />
                                </div>
                            )}

                            {/* Subtle Glow Over */}
                            <div className="absolute inset-0 bg-linear-to-br from-orange-400/0 via-transparent to-orange-400/5 group-hover:from-orange-400/10 transition-all duration-500" />
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}


