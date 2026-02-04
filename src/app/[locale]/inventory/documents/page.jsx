"use client";
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getCompanySalesInvoices, getCompanyInventoryMedia } from '@/services/documentService';
import FolderNavigation from '@/components/documents/FolderNavigation';
import InvoicePreviewModal from '@/app/[locale]/inventory/billing/components/InvoicePreviewModal';
import { Search, Menu, AlertCircle } from 'lucide-react';
import { Alert, CircularProgress } from '@mui/material';

// Explorer Components
import YearGrid from '@/components/documents/explorer/YearGrid';
import MonthGrid from '@/components/documents/explorer/MonthGrid';
import DocumentList from '@/components/documents/explorer/DocumentList';

// Skeletons
import YearGridSkeleton from '@/components/documents/explorer/skeletons/YearGridSkeleton';
import MonthGridSkeleton from '@/components/documents/explorer/skeletons/MonthGridSkeleton';
import DocumentListSkeleton from '@/components/documents/explorer/skeletons/DocumentListSkeleton';

export default function DocumentsPage() {
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
    category: "Sales & Orders", // Defaulting to the category we have data for
    year: null,
    month: null
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // 1. Fetch Invoices from Backend
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

  // 2. Fetch Inventory Media (Barcodes/QRs) from Backend
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    isError: isInventoryError,
    error: inventoryError
  } = useQuery({
    queryKey: ['inventoryMedia', companyId],
    queryFn: () => getCompanyInventoryMedia(companyId, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 10 * 60 * 1000, // Assets change less frequently
  });

  const isLoading = isInvoicesLoading || isInventoryLoading;
  const isError = isInvoicesError || isInventoryError;
  const error = invoicesError || inventoryError;

  // Transform Backend Data to Explorer Format
  const allDocs = useMemo(() => {
    const docs = [];

    // Map Invoices
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

    // Map Inventory Media
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

  // --- Derived Data Logic ---
  const filteredByCategory = useMemo(() => {
    if (drillState.category === "All Files") return allDocs;
    return allDocs.filter(d => d.category === drillState.category);
  }, [allDocs, drillState.category]);

  const availableYears = useMemo(() => {
    const years = new Set(
      filteredByCategory
        .map(d => {
          const year = new Date(d.date).getFullYear();
          return isNaN(year) ? null : year;
        })
        .filter(y => y !== null)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredByCategory]);

  const availableMonths = useMemo(() => {
    if (!drillState.year) return [];
    const yearDocs = filteredByCategory.filter(d => new Date(d.date).getFullYear() === drillState.year);
    const months = new Set(yearDocs.map(d => new Date(d.date).getMonth() + 1)); // 1-based
    return Array.from(months).sort((a, b) => a - b);
  }, [filteredByCategory, drillState.year]);

  const currentDocs = useMemo(() => {
    if (!drillState.year || !drillState.month) return [];
    const docs = filteredByCategory.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === drillState.year && (date.getMonth() + 1) === drillState.month;
    });
    // Sort by date desc in the list
    return docs.sort((a, b) => b - a);
  }, [filteredByCategory, drillState.year, drillState.month]);

  // --- Handlers ---
  const handleCategorySelect = (cat) => {
    setDrillState({ category: cat, year: null, month: null });
    setSelectedIds([]); // Clear selection on navigate
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (actionType) => {
    console.log(`[DocumentsPage] Bulk Action: ${actionType} on IDs:`, selectedIds);
    // Real implementation would call a delete/archive service
    setSelectedIds([]); // Clear after action
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      <div className="flex flex-1 overflow-hidden">

        {/* Main Content Area (Dynamic Explorer) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">

          {/* Top Bar / Breadcrumb / Simulator */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {/* Mobile: sidebar toggle */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100/50"
                aria-label="Open folders"
              >
                <Menu size={18} className="text-gray-700" />
              </button>
              <span className="font-bold text-gray-900 cursor-pointer hover:text-orange-600" onClick={() => setDrillState({ ...drillState, year: null, month: null })}>
                {drillState.category}
              </span>
              {drillState.year && (
                <>
                  <span>/</span>
                  <span className="cursor-pointer hover:text-orange-600" onClick={() => setDrillState({ ...drillState, month: null })}>{drillState.year}</span>
                </>
              )}
              {drillState.month && (
                <>
                  <span>/</span>
                  <span>{new Date(drillState.year, drillState.month - 1).toLocaleString('default', { month: 'long' })}</span>
                </>
              )}
            </div>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 pl-9 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Hierarchical Drill-down View */}
            {isLoading ? (
              !drillState.year ? <YearGridSkeleton /> :
                !drillState.month ? <MonthGridSkeleton /> :
                  <DocumentListSkeleton />
            ) : isError ? (
              <div className="p-8">
                <Alert severity="error" icon={<AlertCircle size={20} />}>
                  {error?.message || "Failed to sync with document repository. Please check your connection."}
                </Alert>
              </div>
            ) : (
              <>
                {!drillState.year ? (
                  <YearGrid
                    years={availableYears}
                    onSelectYear={(y) => setDrillState(prev => ({ ...prev, year: y }))}
                  />
                ) : !drillState.month ? (
                  <MonthGrid
                    year={drillState.year}
                    availableMonths={availableMonths}
                    onSelectMonth={(m) => setDrillState(prev => ({ ...prev, month: m }))}
                    onBack={() => setDrillState(prev => ({ ...prev, year: null }))}
                  />
                ) : (
                  <DocumentList
                    documents={currentDocs}
                    year={drillState.year}
                    month={drillState.month}
                    onOpenValues={setSelectedDoc}
                    onBack={() => setDrillState(prev => ({ ...prev, month: null }))}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                  />
                )}
              </>
            )}
          </div>

          {/* Floating Bulk Action Toolbar */}
          {selectedIds.length > 0 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#081422] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <span className="text-sm font-medium border-r border-gray-600 pr-6">
                {selectedIds.length} Selected
              </span>

              <button
                onClick={() => handleBulkAction('archive')}
                className="flex items-center gap-2 text-sm font-bold hover:text-orange-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Archive
              </button>

              <button
                onClick={() => handleBulkAction('trash')}
                className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Trash
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="ml-2 hover:bg-gray-700/50 p-1 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

        </div>

        {/* Right Pane: Folder Navigation (desktop) */}
        <div className="hidden md:block border-l border-gray-200 bg-white flex-shrink-0 transition-all duration-300 w-80">
          <FolderNavigation onSelect={handleCategorySelect} activeCategory={drillState.category} />
        </div>

        {/* Mobile Slide-over Sidebar */}
        {showSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSidebar(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-lg p-4 overflow-y-auto">
              <button className="mb-4 text-sm text-gray-500" onClick={() => setShowSidebar(false)}>Close</button>
              <FolderNavigation onSelect={(cat) => { handleCategorySelect(cat); setShowSidebar(false); }} activeCategory={drillState.category} />
            </div>
          </div>
        )}

      </div>

      {/* Full-Screen Immersive Document Viewer */}
      <InvoicePreviewModal
        invoice={selectedDoc}
        open={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}