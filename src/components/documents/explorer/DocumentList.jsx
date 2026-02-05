import { ArrowLeft, FileText, Eye, Download, LayoutGrid, List, FileCheck, HardDrive } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

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
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-right-4 duration-1000">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
                <div className="flex items-center gap-8">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50 rounded-2xl text-slate-400 hover:text-orange-600 transition-all duration-300 shadow-sm"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.3em]">{year} Repository</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{monthName}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[#081422] tracking-tight">
                            Records <span className="text-slate-300 font-medium ml-2 text-2xl">({documents.length})</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                        <button className="p-2 bg-white text-orange-600 rounded-lg shadow-sm border border-slate-100"><List size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><LayoutGrid size={18} /></button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {documents.map((doc, idx) => {
                    const isSelected = selectedIds?.includes(doc.id);
                    return (
                        <div
                            key={doc.id}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className={`group relative flex flex-col sm:flex-row sm:items-center p-6 border rounded-[2rem] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_-12px_rgba(255,120,45,0.1)] overflow-hidden ${isSelected
                                ? 'bg-orange-50/40 border-orange-200'
                                : 'bg-white border-slate-50 hover:border-orange-100'
                                } hover:-translate-y-2`}
                        >
                            {/* Brand Side Accent */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors duration-500 ${isSelected ? 'bg-orange-600' : 'bg-slate-100 group-hover:bg-[#ff782d]'}`} />

                            {/* Simple Checkbox */}
                            <div
                                className="mb-4 sm:mb-0 sm:ml-4 sm:mr-8 cursor-pointer relative z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(doc.id);
                                }}
                            >
                                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${isSelected
                                    ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-100 rotate-[360deg]'
                                    : 'bg-white border-slate-200 group-hover:border-orange-300'
                                    }`}>
                                    {isSelected && <FileCheck size={16} className="text-white" strokeWidth={3} />}
                                </div>
                            </div>

                            {/* Refined Icon */}
                            <div className="relative mb-4 sm:mb-0 sm:mr-8 relative z-10">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-500 shadow-sm ${isSelected ? 'bg-[#081422] text-white border-transparent' : 'bg-slate-50 text-[#ff782d] border-slate-100 group-hover:bg-[#081422] group-hover:text-white group-hover:rotate-12 group-hover:scale-110'}`}>
                                    <FileText size={30} strokeWidth={1.5} />
                                </div>
                            </div>

                            {/* Crisp Info */}
                            <div className="flex-1 min-w-0 pr-4 relative z-10">
                                <h3 className={`text-xl font-bold tracking-tight mb-1 truncate transition-colors ${isSelected ? 'text-orange-950' : 'text-[#081422]'}`}>
                                    {doc.name}
                                </h3>
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        {dayjs(doc.date).format("MMM DD, YYYY")}
                                    </span>
                                    <span className="flex items-center gap-2 opacity-60">
                                        <HardDrive size={12} />
                                        {doc.size}
                                    </span>
                                </div>
                            </div>

                            {/* Action Group */}
                            <div className="mt-6 sm:mt-0 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 relative z-10">
                                <button
                                    onClick={() => onOpenValues(doc)}
                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#081422] bg-white border border-slate-100 rounded-2xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                >
                                    <Eye size={16} />
                                    Preview
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(doc);
                                    }}
                                    className="p-3 text-white bg-[#ff782d] rounded-2xl hover:bg-[#081422] transition-all shadow-lg shadow-orange-100 active:scale-95"
                                    title="Download"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
