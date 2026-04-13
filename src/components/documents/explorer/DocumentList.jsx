"use client";
import { ArrowLeft, FileText, Eye, Download, LayoutGrid, List, FileCheck, HardDrive, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DocumentList - Premium Glassmorphic Record Shell
 */
export default function DocumentList({ documents, year, month, onOpenValues, onBack, selectedIds, onToggleSelect }) {
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    const handleDownload = async (doc) => {
        if (!doc.pdfUrl) {
            toast.error("No download URL available for this document");
            return;
        }

        const toastId = toast.loading(`Preparing ${doc.name}...`);
        try {
            const response = await fetch(doc.pdfUrl);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${doc.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            toast.success("Download complete!", { id: toastId });
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Download failed. Opening in tab...", { id: toastId });
            window.open(doc.pdfUrl, '_blank');
        }
    };

    return (
        <div className="p-4 sm:p-12 max-w-[1700px] mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                <div className="flex items-center gap-8">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="p-4 bg-white/70 backdrop-blur-md border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-200 rounded-3xl shadow-sm transition-all duration-300"
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">{year} Archive</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{monthName}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-[#081422] tracking-tight">
                            Records <span className="text-slate-200 font-medium ml-2 text-2xl">/{documents.length}</span>
                        </h2>
                    </div>
                </div>

                {/* View Controls (Simulated) */}
                <div className="flex items-center gap-3">
                    <div className="flex p-1.5 bg-slate-50/50 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm">
                        <button className="p-2.5 bg-white text-orange-600 rounded-xl shadow-xs border border-slate-100">
                            <List size={20} />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* List Body */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {documents.map((doc, idx) => {
                        const isSelected = selectedIds?.includes(doc.id);
                        return (
                            <motion.div
                                key={doc.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05, duration: 0.6 }}
                                className={`group relative flex flex-col md:flex-row md:items-center p-5 md:p-6 border transition-all duration-700 rounded-4xl overflow-hidden ${isSelected
                                    ? 'bg-orange-50/40 border-orange-200/60'
                                    : 'bg-white/40 backdrop-blur-2xl border-white/80 hover:border-orange-200/40 hover:bg-white/95'
                                }`}
                            >
                                {/* Active Indicator Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors duration-500 ${isSelected ? 'bg-orange-500' : 'bg-transparent group-hover:bg-orange-400/30'}`} />

                                {/* Checkbox / Selection */}
                                <div className="mb-4 md:mb-0 md:ml-4 md:mr-8 shrink-0 relative z-10">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onToggleSelect(doc.id)}
                                        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${isSelected
                                            ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-100'
                                            : 'bg-white/50 border-slate-200 group-hover:border-orange-400'
                                        }`}
                                    >
                                        {isSelected && <FileCheck size={18} className="text-white" strokeWidth={3} />}
                                    </motion.button>
                                </div>

                                {/* Icon Presentation */}
                                <div className="mb-4 md:mb-0 md:mr-8 shrink-0 relative z-10">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-700 shadow-sm ${isSelected 
                                        ? 'bg-[#081422] text-white border-transparent scale-105' 
                                        : 'bg-slate-50 text-orange-500 border-slate-100 group-hover:bg-[#081422] group-hover:text-white group-hover:rotate-6'}`}>
                                        <FileText size={32} strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Document Info Core */}
                                <div className="flex-1 min-w-0 pr-4 relative z-10">
                                    <h3 className={`text-xl font-black tracking-tight mb-2 truncate transition-colors ${isSelected ? 'text-orange-950' : 'text-[#081422]'}`}>
                                        {doc.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <Calendar size={12} className="text-orange-400" />
                                            {dayjs(doc.date).format("MMMM DD, YYYY")}
                                        </span>
                                        <span className="flex items-center gap-2 bg-slate-50/80 px-2 py-0.5 rounded-md border border-slate-100 text-[9px]">
                                            <HardDrive size={10} />
                                            {doc.size}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions Interface */}
                                <div className="mt-6 md:mt-0 flex items-center gap-3 relative z-10">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onOpenValues(doc)}
                                        className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-[#081422] bg-white border border-slate-100 rounded-2xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-xs flex items-center gap-2"
                                    >
                                        <Eye size={18} />
                                        Preview
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(doc);
                                        }}
                                        className="w-12 h-12 flex items-center justify-center text-white bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl hover:from-[#081422] hover:to-[#081422] transition-all shadow-lg shadow-orange-100 duration-500"
                                    >
                                        <Download size={22} />
                                    </motion.button>
                                </div>

                                {/* Premium Back-glow on hover */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-orange-400/0 to-transparent group-hover:from-orange-400/3 transition-all duration-700" />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

