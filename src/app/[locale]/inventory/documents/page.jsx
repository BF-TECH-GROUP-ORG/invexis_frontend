"use client";
import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from '@/features/documents/documentsSlice';
import FolderNavigation from '@/components/documents/FolderNavigation';
import PreviewPanel from '@/components/documents/PreviewPanel';
import EventSimulator from '@/components/documents/EventSimulator';

// Explorer Components
import YearGrid from '@/components/documents/explorer/YearGrid';
import MonthGrid from '@/components/documents/explorer/MonthGrid';
import DocumentList from '@/components/documents/explorer/DocumentList';
import RecentDocsList from '@/components/documents/explorer/RecentDocsList';

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const { items: allDocs, status } = useSelector((state) => state.documents);

  // Navigation State
  const [drillState, setDrillState] = useState({
    category: "All Files", // Default
    year: null,
    month: null
  });

  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchData());
    }
  }, [status, dispatch]);

  // --- Derived Data Logic ---
  const filteredByCategory = useMemo(() => {
    if (drillState.category === "All Files") return allDocs;
    // Map sidebar labels to data categories if needed, or loosely match
    return allDocs.filter(d =>
      drillState.category === "All Files" ||
      d.category === drillState.category ||
      (drillState.category === "Sales & Orders" && ["Sales", "Orders", "Finance"].includes(d.category)) ||
      (drillState.category === "Financial" && d.category === "Finance") ||
      (drillState.category === "Inventory" && d.category === "Procurement")
    );
  }, [allDocs, drillState.category]);

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
  }

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
            <EventSimulator />
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Render Logic */}
            {!drillState.year ? (
              <>
                <RecentDocsList documents={recentDocs} onOpenValues={setSelectedDoc} />
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
              />
            )}
          </div>
        </div>

        {/* Right Pane: Folder Navigation */}
        <div className="w-64 border-l border-gray-200 bg-white flex-shrink-0 z-10">
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