"use client";
import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from '@/features/documents/documentsSlice';
import FolderNavigation from '@/components/documents/FolderNavigation';
import PreviewPanel from '@/components/documents/PreviewPanel';
import EventSimulator from '@/components/documents/EventSimulator';

import YearGrid from '@/components/documents/explorer/YearGrid';
import MonthGrid from '@/components/documents/explorer/MonthGrid';
import DocumentList from '@/components/documents/explorer/DocumentList';
import RecentDocsList from '@/components/documents/explorer/RecentDocsList';

export default function DocumentsPage() {
  const dispatch = useDispatch();
  
  // ← THIS IS THE KEY FIX: default to empty array if items is null/undefined
  const { items: allDocs = [], status, error } = useSelector((state) => state.documents);

  const [drillState, setDrillState] = useState({
    category: "All Files",
    year: null,
    month: null
  });
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchData());
    }
  }, [status, dispatch]);

  // -----------------------------------------------------------------
  // Always return an array → no more ".map is not a function"
  // -----------------------------------------------------------------
  const filteredByCategory = useMemo(() => {
    if (drillState.category === "All Files") return allDocs;

    return allDocs.filter(d =>
      d.category === drillState.category ||
      (drillState.category === "Sales & Orders" && ["Sales", "Orders", "Finance"].includes(d.category)) ||
      (drillState.category === "Financial" && d.category === "Finance") ||
      (drillState.category === "Inventory" && d.category === "Procurement")
    );
  }, [allDocs, drillState.category]);

  const recentDocs = useMemo(() => {
    return [...filteredByCategory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [filteredByCategory]);

  const availableYears = useMemo(() => {
    const years = new Set(filteredByCategory.map(d => new Date(d.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredByCategory]);

  const availableMonths = useMemo(() => {
    if (!drillState.year) return [];
    const yearDocs = filteredByCategory.filter(d => new Date(d.date).getFullYear() === drillState.year);
    const months = new Set(yearDocs.map(d => new Date(d.date).getMonth() + 1));
    return Array.from(months).sort((a, b) => a - b);
  }, [filteredByCategory, drillState.year]);

  const currentDocs = useMemo(() => {
    if (!drillState.year || !drillState.month) return [];
    const docs = filteredByCategory.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === drillState.year && (date.getMonth() + 1) === drillState.month;
    });
    return docs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredByCategory, drillState.year, drillState.month]);

  const handleCategorySelect = (cat) => {
    setDrillState({ category: cat, year: null, month: null });
  };

  // -----------------------------------------------------------------
  // Optional but highly recommended: show loading / error states
  // -----------------------------------------------------------------
  if (status === 'loading') {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white rounded-xl">
        <p className="text-lg text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4 bg-white rounded-xl">
        <p className="text-red-600">Failed to load documents</p>
        <button
          onClick={() => dispatch(fetchData())}
          className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Normal UI (exactly like your original code)
  // -----------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span
                className="font-bold text-gray-900 cursor-pointer hover:text-orange-600"
                onClick={() => setDrillState({ ...drillState, year: null, month: null })}
              >
                {drillState.category}
              </span>
              {drillState.year && (
                <>
                  <span>/</span>
                  <span
                    className="cursor-pointer hover:text-orange-600"
                    onClick={() => setDrillState({ ...drillState, month: null })}
                  >
                    {drillState.year}
                  </span>
                </>
              )}
              {drillState.month && (
                <>
                  <span>/</span>
                  <span>
                    {new Date(drillState.year, drillState.month - 1).toLocaleString('default', { month: 'long' })}
                  </span>
                </>
              )}
            </div>
            <EventSimulator />
          </div>

          <div className="flex-1 overflow-y-auto">
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

        {/* Sidebar */}
        <div className="w-64 border-l border-gray-200 bg-white flex-shrink-0 z-10">
          <FolderNavigation onSelect={handleCategorySelect} activeCategory={drillState.category} />
        </div>

        {/* Preview Overlay */}
        {selectedDoc && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex justify-end">
            <div className="w-[1000px] h-full shadow-2xl bg-white border-l border-gray-200">
              <PreviewPanel document={selectedDoc} onClose={() => setSelectedDoc(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}