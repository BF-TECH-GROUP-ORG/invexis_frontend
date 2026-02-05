"use client";
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    X, Download, Printer, Share2, Info,
    ChevronLeft, ChevronRight, Maximize2,
    Archive, Trash2, ShieldCheck, Clock
} from 'lucide-react';
import { downloadDocument, archiveDocument, trashDocument } from '@/features/documents/documentsSlice';

export default function PreviewPanel({ document, onClose }) {
    const dispatch = useDispatch();
    const [showInfo, setShowInfo] = useState(false);
    const [zoom, setZoom] = useState(1);

    if (!document) return null;

    const handleDownload = () => {
        dispatch(downloadDocument({ id: document.id, name: document.name }));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0c141d]/95 backdrop-blur-md flex flex-col animate-in fade-in duration-500 print:bg-white print:backdrop-blur-0">
            {/* Immersive Header */}
            <div className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-xl relative z-[110] print:hidden">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                    <div>
                        <h3 className="text-white font-bold text-lg tracking-tight truncate max-w-[300px]">
                            {document.name}
                        </h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                            {document.type} repository // {document.id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full mr-4 text-white/60 text-xs font-bold uppercase tracking-widest">
                        <Clock size={14} className="text-orange-400" />
                        Last Read: Just Now
                    </div>

                    <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                        <button onClick={handleDownload} className="p-2 sm:p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Download Copy">
                            <Download size={20} />
                        </button>
                        <button onClick={handlePrint} className="p-2 sm:p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Print Document">
                            <Printer size={20} />
                        </button>
                        <button className="p-2 sm:p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Share Access">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-3 rounded-2xl transition-all ${showInfo ? 'bg-orange-500 text-white shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
                    >
                        <Info size={22} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden print:overflow-visible print:bg-white">
                {/* Main Viewer Area */}
                <div className="flex-1 flex flex-col items-center overflow-y-auto p-12 scrollbar-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent print:bg-none print:p-0 print:overflow-visible">
                    {/* The High-Fidelity Paper */}
                    <div
                        style={{ transform: `scale(${zoom})` }}
                        className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-[21cm] min-h-[29.7cm] p-16 relative flex flex-col transition-transform duration-500 origin-top mb-20 rounded-sm print:shadow-none print:transform-none print:mb-0 print:p-0 print:w-full print:max-w-none"
                    >
                        {/* Header Mockup */}
                        <div className="flex justify-between items-start mb-16 border-b-4 border-[#081422] pb-10">
                            <div>
                                <h1 className="text-4xl font-black text-[#081422] tracking-tighter mb-2 italic">INVEXIS</h1>
                                <p className="text-[#081422]/60 text-xs font-bold uppercase tracking-widest">Asset Management & Financial Intelligence</p>
                                <div className="mt-4 flex items-center gap-3 print:hidden">
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                                        <ShieldCheck size={10} />
                                        Verified Internal
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-[#081422]/10 uppercase tracking-tighter absolute top-16 right-16 rotate-0 h-10 select-none print:hidden">{document.type}</h2>
                                <p className="font-mono text-lg font-black text-[#081422] mt-10">REF: {document.id.toUpperCase()}</p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Date issued: {document.date}</p>
                            </div>
                        </div>

                        {/* Content Body Rendering */}
                        <div className="flex-1 space-y-12">
                            <div className="flex justify-between text-sm">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Entity Origin</p>
                                        <p className="font-black text-[#081422] text-xl">Invexis Global Corp</p>
                                        <p className="text-slate-500 font-medium leading-relaxed max-w-xs text-xs italic">HQ Gateway Drive, Terminal 4-B<br />Distributed Ledger Division</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Target Account</p>
                                        <p className="font-black text-[#081422] text-lg">External Partner Entity</p>
                                        <p className="text-slate-500 font-medium text-xs">Standard Routing: 0049-XX</p>
                                    </div>
                                </div>
                            </div>

                            {/* Data Grid Mockup */}
                            <div className="relative">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100/50 text-left text-slate-400">
                                            <th className="py-4 font-black uppercase tracking-[0.2em] text-[9px]">Ledger Entry</th>
                                            <th className="py-4 text-right font-black uppercase tracking-[0.2em] text-[9px]">Volume</th>
                                            <th className="py-4 text-right font-black uppercase tracking-[0.2em] text-[9px]">Rate</th>
                                            <th className="py-4 text-right font-black uppercase tracking-[0.2em] text-[9px]">Index Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[1, 2, 3].map(i => (
                                            <tr key={i}>
                                                <td className="py-6 pr-8">
                                                    <p className="font-black text-[#081422]">Fiscal Record Segment {i}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Classification: Type-A Operating Expense</p>
                                                </td>
                                                <td className="py-6 text-right font-bold text-slate-600 italic">x {i * 2}</td>
                                                <td className="py-6 text-right font-medium text-slate-900">${(i * 125).toLocaleString()}</td>
                                                <td className="py-6 text-right font-black text-[#081422] text-lg tracking-tighter">${(i * i * 250).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Summary */}
                            <div className="flex justify-end pt-10">
                                <div className="p-8 bg-slate-50 rounded-3xl w-72 border border-slate-100 print:bg-white print:border-slate-200">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs font-bold text-slate-400">
                                            <span>BASE INDEX</span>
                                            <span>$4,125.00</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400">
                                            <span>MARGIN (2.5%)</span>
                                            <span>$103.12</span>
                                        </div>
                                        <div className="h-[1px] bg-slate-200 my-2" />
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">GRAND TOTAL</span>
                                            <span className="text-3xl font-black text-[#081422] tracking-tighter">$4,228.12</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Authenticator */}
                        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center opacity-40">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#081422] text-white flex items-center justify-center rounded-lg font-black italic">IX</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    <p>© 2026 Invexis Blockchain Auth</p>
                                    <p className="mt-0.5">Hash: {document.id.substring(0, 16)}...</p>
                                </div>
                            </div>
                            <div className="w-24 h-24 border-2 border-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-300 uppercase tracking-tighter text-center leading-none">
                                System<br />Seal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata Sidebar - Sliding Gmail Menu */}
                {showInfo && (
                    <div className="w-96 bg-white border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-500 overflow-y-auto print:hidden">
                        <div className="p-8 border-b border-gray-100">
                            <h4 className="text-xl font-black text-[#081422] tracking-tighter flex items-center gap-3">
                                <Info className="text-orange-500" size={24} />
                                Document Intelligence
                            </h4>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-black text-orange-950">{document.status}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Index Size</p>
                                    <p className="text-sm font-black text-slate-900">{document.size}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Anchor</span>
                                    <span className="text-sm font-bold text-[#081422] truncate">{document.id}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Holder</span>
                                    <span className="text-sm font-bold text-[#081422]">Invexis Global Partners</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Path</span>
                                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                        <ShieldCheck size={16} />
                                        End-to-End Encrypted
                                    </span>
                                </div>
                            </div>

                            {/* Activity Log - Refined */}
                            <div className="pt-8 border-t border-gray-100">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Audit Timeline</h5>
                                <div className="space-y-8">
                                    {document.activity && document.activity.map((act, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            {i !== document.activity.length - 1 && (
                                                <div className="absolute left-[7px] top-6 bottom-[-32px] w-[1px] bg-slate-100" />
                                            )}
                                            <div className="w-4 h-4 rounded-full border-2 border-white bg-orange-500 mt-1 shadow-sm relative z-10" />
                                            <div>
                                                <p className="text-[11px] font-black text-[#081422]">{act.action}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 capitalize">{act.date} • {act.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-4">
                            <button className="flex-1 py-4 bg-[#081422] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                                Archive Doc
                            </button>
                            <button className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Viewer Controls Layer */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#081422] p-2 rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] print:hidden">
                <button
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                    className="p-3 text-white/70 hover:text-orange-500 hover:bg-white/5 rounded-full transition-all"
                >
                    <div className="w-4 h-0.5 bg-current" />
                </button>
                <div className="text-white text-xs font-black min-w-16 text-center tracking-widest">
                    {Math.round(zoom * 100)}%
                </div>
                <button
                    onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                    className="p-3 text-white/70 hover:text-orange-500 hover:bg-white/5 rounded-full transition-all overflow-hidden relative"
                >
                    <div className="h-4 w-0.5 bg-current mx-auto" />
                    <div className="w-4 h-0.5 bg-current absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </button>
                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                <button
                    onClick={() => setZoom(1)}
                    className="p-3 text-white/70 hover:text-orange-400 hover:bg-white/5 rounded-full transition-all"
                    title="Reset Zoom"
                >
                    <Maximize2 size={18} />
                </button>
            </div>
        </div>
    );
}
