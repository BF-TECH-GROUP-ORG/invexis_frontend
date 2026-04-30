"use client";
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getCompanySalesInvoices, getCompanyInventoryMedia } from '@/services/documentService';
import FolderNavigation from '@/components/documents/FolderNavigation';
import InvoicePreviewModal from '@/app/[locale]/inventory/billing/components/InvoicePreviewModal';
import { Search, Menu, AlertCircle, Filter, MoreVertical } from 'lucide-react';
import { Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Explorer Components
import YearGrid from '@/components/documents/explorer/YearGrid';
import MonthGrid from '@/components/documents/explorer/MonthGrid';
import DocumentList from '@/components/documents/explorer/DocumentList';

// Skeletons
import YearGridSkeleton from '@/components/documents/explorer/skeletons/YearGridSkeleton';
import MonthGridSkeleton from '@/components/documents/explorer/skeletons/MonthGridSkeleton';
import DocumentListSkeleton from '@/components/documents/explorer/skeletons/DocumentListSkeleton';

/**
 * DocumentsPageClient - Unified Premium Document Repository
 */
export default function DocumentsPageClient() {
    const { data: session } = useSession();

    // Robust companyId extraction
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Prepare options with auth header
    const options = useMemo(() => session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {}, [session?.accessToken]);

    // Navigation State
    const [drillState, setDrillState] = useState({
        category: "Sales & Orders",
        year: null,
        month: null
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); // 'all', 'invoice', 'media'
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);

    // 1. Fetch Invoices
    const {
        data: invoicesData,
        isLoading: isInvoicesLoading,
        isError: isInvoicesError,
        error: invoicesError
    } = useQuery({
        queryKey: ['salesInvoices', companyId],
        queryFn: () => getCompanySalesInvoices(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 5 * 60 * 1000,
    });

    // 2. Fetch Inventory Media
    const {
        data: inventoryData,
        isLoading: isInventoryLoading,
        isError: isInventoryError,
        error: inventoryError
    } = useQuery({
        queryKey: ['inventoryMedia', companyId],
        queryFn: () => getCompanyInventoryMedia(companyId, options),
        enabled: !!companyId && !!session?.accessToken,
        staleTime: 10 * 60 * 1000,
    });

    const isLoading = isInvoicesLoading || isInventoryLoading;
    const isError = isInvoicesError || isInventoryError;
    const error = invoicesError || inventoryError;

    // Transform Backend Data
    const allDocs = useMemo(() => {
        const docs = [];
        if (invoicesData?.data && Array.isArray(invoicesData.data)) {
            invoicesData.data.forEach(doc => {
                const metadata = doc.metadata || {};
                const storage = doc.storage || {};
                docs.push({
                    id: doc.documentId || doc._id,
                    name: metadata.invoiceNumber || `Invoice-${doc.documentId?.slice(0, 8)}`,
                    date: doc.createdAt,
                    size: storage.size ? `${(storage.size / 1024).toFixed(1)} KB` : "N/A",
                    type: doc.type || "invoice",
                    category: "Sales & Orders",
                    pdfUrl: storage.url,
                    customer: { name: metadata.companyName || metadata.shopName || "Company Record" }
                });
            });
        }
        if (inventoryData?.data && Array.isArray(inventoryData.data)) {
            inventoryData.data.forEach(doc => {
                const metadata = doc.metadata || {};
                const storage = doc.storage || {};
                const label = doc.type === 'barcode' ? 'Barcode' : 'QR Code';
                docs.push({
                    id: doc.documentId || doc._id,
                    name: `${label}: ${metadata.sku || 'Unknown SKU'}`,
                    date: doc.createdAt,
                    size: storage.size ? `${(storage.size / 1024).toFixed(1)} KB` : "N/A",
                    type: doc.type || "media",
                    category: "Inventory",
                    pdfUrl: storage.url,
                    customer: { name: `Product SKU: ${metadata.sku || 'N/A'}` }
                });
            });
        }
        return docs;
    }, [invoicesData, inventoryData]);

    const filteredByCategory = useMemo(() => {
        let docs = drillState.category === "All Files" ? allDocs : allDocs.filter(d => d.category === drillState.category);
        
        // Apply Type Filter
        if (filterType !== "all") {
            docs = docs.filter(d => d.type === filterType);
        }

        if (searchTerm) {
            docs = docs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return docs;
    }, [allDocs, drillState.category, searchTerm, filterType]);

    const availableYears = useMemo(() => {
        const years = new Set(filteredByCategory.map(d => new Date(d.date).getFullYear()).filter(y => !isNaN(y)));
        return Array.from(years).sort((a, b) => b - a);
    }, [filteredByCategory]);

    const availableMonths = useMemo(() => {
        if (!drillState.year) return [];
        const months = new Set(filteredByCategory.filter(d => new Date(d.date).getFullYear() === drillState.year).map(d => new Date(d.date).getMonth() + 1));
        return Array.from(months).sort((a, b) => a - b);
    }, [filteredByCategory, drillState.year]);

    const currentDocs = useMemo(() => {
        if (!drillState.year || !drillState.month) return [];
        return filteredByCategory.filter(d => {
            const date = new Date(d.date);
            return date.getFullYear() === drillState.year && (date.getMonth() + 1) === drillState.month;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [filteredByCategory, drillState.year, drillState.month]);

    const handleCategorySelect = (cat) => {
        setDrillState({ category: cat, year: null, month: null });
        setSelectedIds([]);
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-slate-50/50 rounded-4xl border border-white/80 shadow-lg overflow-hidden backdrop-blur-sm">
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white/40 relative">
                    {/* Integrated Top Bar */}
                    <div className="px-8 py-6 flex flex-col sm:flex-row gap-6 justify-between items-center z-20">
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowSidebar(true)}
                                className="md:hidden p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600"
                            >
                                <Menu size={20} />
                            </motion.button>
                            
                            <div className="flex flex-col">
                                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                    <span className="cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setDrillState({ ...drillState, year: null, month: null })}>
                                        {drillState.category}
                                    </span>
                                    {(drillState.year || drillState.month) && <span className="text-slate-200">/</span>}
                                    {drillState.year && (
                                        <span className="cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setDrillState({ ...drillState, month: null })}>
                                            {drillState.year}
                                        </span>
                                    )}
                                </nav>
                                <h1 className="text-2xl font-black text-[#081422] tracking-tight">
                                    {drillState.month 
                                        ? new Date(drillState.year, drillState.month - 1).toLocaleString('default', { month: 'long' })
                                        : drillState.year 
                                            ? `${drillState.year} Records`
                                            : "Repository"
                                    }
                                </h1>
                            </div>
                        </div>

                        {/* Search & Global Actions */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                                <button onClick={() => setShowFilterMenu(!showFilterMenu)} className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-[#081422] transition-all hidden">
                                    <Menu size={20} />
                                </button>
                            <button className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-[#081422] transition-all">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-12">
                        {isLoading ? (
                            !drillState.year ? <YearGridSkeleton /> : !drillState.month ? <MonthGridSkeleton /> : <DocumentListSkeleton />
                        ) : isError ? (
                            <div className="p-12">
                                <Alert severity="error" className="rounded-3xl border border-red-100 bg-red-50/50" icon={<AlertCircle size={24} />}>
                                    <span className="font-bold text-red-900">Sync Error:</span> {error?.message || "Failed to reach document node."}
                                </Alert>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {!drillState.year ? (
                                    <YearGrid years={availableYears} onSelectYear={(y) => setDrillState(prev => ({ ...prev, year: y }))} />
                                ) : !drillState.month ? (
                                    <MonthGrid year={drillState.year} availableMonths={availableMonths} onSelectMonth={(m) => setDrillState(prev => ({ ...prev, month: m }))} onBack={() => setDrillState(prev => ({ ...prev, year: null }))} />
                                ) : (
                                    <DocumentList documents={currentDocs} year={drillState.year} month={drillState.month} onOpenValues={setSelectedDoc} onBack={() => setDrillState(prev => ({ ...prev, month: null }))} selectedIds={selectedIds} onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])} />
                                )}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Premium Floating Selection Toolbar */}
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div 
                                initial={{ y: 100, x: "-50%" }}
                                animate={{ y: 0, x: "-50%" }}
                                exit={{ y: 100, x: "-50%" }}
                                className="fixed bottom-10 left-1/2 p-2 bg-[#081422]/95 backdrop-blur-md rounded-3xl shadow-[0_30px_60px_-15px_rgba(8,20,34,0.4)] flex items-center gap-2 z-100 border border-white/10"
                            >
                                <div className="px-6 py-2 border-r border-white/10 flex flex-col">
                                    <span className="text-xl font-black text-white">{selectedIds.length}</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest -mt-1">Selected Items</span>
                                </div>
                                
                                <div className="flex items-center gap-1 p-1">
                                    <button className="px-8 py-3 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                        <ShoppingCart size={16} className="text-orange-400" />
                                        Process Orders
                                    </button>
                                    <button onClick={() => setSelectedIds([])} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                                        <AlertCircle size={20} className="rotate-45" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Side Navigation */}
                <div className="hidden md:block">
                    <FolderNavigation 
                        onSelect={handleCategorySelect} 
                        activeCategory={drillState.category}
                        filterType={filterType}
                        onFilterSelect={setFilterType}
                    />
                </div>
            </div>

            <AnimatePresence>
                {showSidebar && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 md:hidden"
                    >
                        <div className="absolute inset-0 bg-[#081422]/60 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="absolute right-0 top-0 bottom-0 w-80 shadow-2xl"
                        >
                            <FolderNavigation 
                                onSelect={(cat) => { handleCategorySelect(cat); setShowSidebar(false); }} 
                                activeCategory={drillState.category}
                                filterType={filterType}
                                onFilterSelect={setFilterType}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <InvoicePreviewModal
                invoice={selectedDoc}
                open={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
            />
        </div>
    );
}

