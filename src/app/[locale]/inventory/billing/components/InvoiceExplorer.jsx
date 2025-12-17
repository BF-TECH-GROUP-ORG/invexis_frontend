"use client";
import { useState, useMemo } from "react";
import { Folder, ChevronRight, ArrowLeft, Calendar } from "lucide-react";
import InvoiceGenerator from "./InvoiceGenerator";

export default function InvoiceExplorer({ invoices }) {
    const [viewState, setViewState] = useState({
        view: "years", // 'years' | 'months' | 'list'
        year: null,
        month: null
    });

    // 1. Group Data Logic
    const groupedData = useMemo(() => {
        const groups = {};
        invoices.forEach(inv => {
            const date = new Date(inv.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });

            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = [];

            groups[year][month].push(inv);
        });
        return groups;
    }, [invoices]);

    const years = Object.keys(groupedData).sort((a, b) => b - a); // Descending years

    // Navigation Handlers
    const handleSelectYear = (year) => {
        setViewState({ view: "months", year, month: null });
    };

    const handleSelectMonth = (month) => {
        setViewState(prev => ({ ...prev, view: "list", month }));
    };

    const handleBack = () => {
        if (viewState.view === "list") {
            setViewState(prev => ({ ...prev, view: "months", month: null }));
        } else if (viewState.view === "months") {
            setViewState({ view: "years", year: null, month: null });
        }
    };

    // Breadcrumb
    const Breadcrumb = () => (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button
                onClick={() => setViewState({ view: "years", year: null, month: null })}
                className="hover:text-orange-600 font-medium transition-colors"
            >
                Invoices
            </button>
            {viewState.year && (
                <>
                    <ChevronRight size={14} />
                    <button
                        onClick={() => setViewState(prev => ({ ...prev, view: "months", month: null }))}
                        className={`transition-colors ${viewState.view === 'months' ? 'font-bold text-gray-800' : 'hover:text-orange-600 font-medium'}`}
                    >
                        {viewState.year}
                    </button>
                </>
            )}
            {viewState.month && (
                <>
                    <ChevronRight size={14} />
                    <span className="font-bold text-gray-800">{viewState.month}</span>
                </>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[400px]">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Folder className="text-orange-500" />
                    Invoice Explorer
                </h2>
                {viewState.view !== "years" && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
            </div>

            <Breadcrumb />

            {/* VIEW: YEARS */}
            {viewState.view === "years" && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => handleSelectYear(year)}
                            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-500 transition-all group shadow-sm hover:shadow-md"
                        >
                            <Folder size={48} className="text-orange-400 group-hover:text-orange-600 transition-colors mb-2" />
                            <span className="font-bold text-gray-700 group-hover:text-orange-900">{year}</span>
                            <span className="text-xs text-gray-400 mt-1">{Object.keys(groupedData[year]).length} Months</span>
                        </button>
                    ))}
                </div>
            )}

            {/* VIEW: MONTHS */}
            {viewState.view === "months" && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in zoom-in-95 duration-200">
                    {Object.keys(groupedData[viewState.year]).map(month => (
                        <button
                            key={month}
                            onClick={() => handleSelectMonth(month)}
                            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-500 transition-all group shadow-sm hover:shadow-md"
                        >
                            <Folder size={48} className="text-blue-400 group-hover:text-blue-600 transition-colors mb-2" />
                            <span className="font-bold text-gray-700 group-hover:text-blue-900">{month}</span>
                            <span className="text-xs text-gray-400 mt-1">{groupedData[viewState.year][month].length} Invoices</span>
                        </button>
                    ))}
                </div>
            )}

            {/* VIEW: LIST (Invoices) */}
            {viewState.view === "list" && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-right-4 duration-300">
                    {groupedData[viewState.year][viewState.month].map(invoice => (
                        <InvoiceGenerator key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}

        </div>
    );
}
