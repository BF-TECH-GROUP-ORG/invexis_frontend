"use client";
import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, archiveDocument, trashDocument } from '@/features/documents/documentsSlice';
import FolderNavigation from '@/components/documents/FolderNavigation';
import PreviewPanel from '@/components/documents/PreviewPanel';
import { Search } from 'lucide-react';

// Explorer Components
import YearGrid from '@/components/documents/explorer/YearGrid';
import MonthGrid from '@/components/documents/explorer/MonthGrid';
import DocumentList from '@/components/documents/explorer/DocumentList';
import RecentDocsList from '@/components/documents/explorer/RecentDocsList';

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const { items: allDocs = [], status } = useSelector((state) => state.documents || {});

  // Navigation State
  const [drillState, setDrillState] = useState({
    category: "All Files", // Default
    year: null,
    month: null
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchData());
    }
  }, [status, dispatch]);

  // --- Derived Data Logic ---
  const filteredByCategory = useMemo(() => {
    const docs = Array.isArray(allDocs) ? allDocs : [];

    return docs.filter(d => {
      // 1. Handle System Folders (Trash / Archived)
      if (drillState.category === "Trash") {
        return d.status === 'Trash';
      }
      if (drillState.category === "Archived") {
        return d.status === 'Archived';
      }

      // 2. Handle Active Folders (Exclude Trash/Archived)
      if (d.status === 'Trash' || d.status === 'Archived') {
        return false;
      }

      // 3. Category Matching
      const matchCategory = drillState.category === "All Files" ||
        d.category === drillState.category ||
        (drillState.category === "Sales & Orders" && ["Sales", "Orders", "Finance"].includes(d.category)) ||
        (drillState.category === "Financial" && d.category === "Finance") ||
        (drillState.category === "Inventory" && d.category === "Procurement");

      if (!matchCategory) return false;

      // 4. Search Filtering
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        return (
          d.name?.toLowerCase().includes(lowerTerm) ||
          d.date?.includes(lowerTerm) ||
          d.type?.toLowerCase().includes(lowerTerm)
        );
      }

      return true;
    });
  }, [allDocs, drillState.category, searchTerm]);

  // Recent Docs (Top 4 by date)
  const recentDocs = useMemo(() => {
    return [...filteredByCategory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [filteredByCategory]);

  const availableYears = useMemo(() => {
    const years = new Set(filteredByCategory.map(d => new Date(d.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // Descending
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
    return docs.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    if (actionType === 'trash') {
      const promises = selectedIds.map(id => dispatch(trashDocument(id)));
      await Promise.all(promises);
    } else if (actionType === 'archive') {
      const promises = selectedIds.map(id => dispatch(archiveDocument(id)));
      await Promise.all(promises);
    }
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-9 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-20"> {/* Added padding for toolbar */}
            {/* Render Logic */}
            {!drillState.year ? (
              <>
                <RecentDocsList
                  documents={recentDocs}
                  onOpenValues={setSelectedDoc}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
                <YearGrid
                  years={availableYears}
                  onSelectYear={(y) => setDrillState(prev => ({ ...prev, year: y }))}
                />
              </>
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

        {/* Right Pane: Folder Navigation */}
        <div className="border-l border-gray-200 bg-white flex-shrink-0 transition-all duration-300">
          <FolderNavigation onSelect={handleCategorySelect} activeCategory={drillState.category} />
        </div>

        {/* Document Viewer Overlay */}
        {selectedDoc && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex justify-end">
            <div className="w-[1000px] h-full shadow-2xl bg-white border-l border-gray-200">
              <PreviewPanel
                document={selectedDoc}
                onClose={() => setSelectedDoc(null)}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}