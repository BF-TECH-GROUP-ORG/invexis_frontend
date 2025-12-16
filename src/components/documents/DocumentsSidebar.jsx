"use client";
import { useDispatch, useSelector } from "react-redux";
import {
    setFilterCategory,
    setFilterStatus,
    resetFilters,
    setFilterType,
} from "@/features/documents/documentsSlice";

export default function DocumentsSidebar() {
    const dispatch = useDispatch();
    const { filterCategory, filterStatus, filterType } = useSelector((s) => s.documents);

    const menuItems = [
        {
            id: "all",
            label: "All Documents",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            action: () => dispatch(resetFilters()),
            isActive: filterCategory === "All" && filterStatus === "All" && filterType === "All",
        },
        {
            id: "financial",
            label: "Financial Docs",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            action: () => {
                dispatch(resetFilters());
                dispatch(setFilterCategory("Finance"));
            },
            isActive: filterCategory === "Finance",
        },
        {
            id: "reports",
            label: "Reports",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            action: () => {
                dispatch(resetFilters());
                dispatch(setFilterCategory("Reports"));
            },
            isActive: filterCategory === "Reports",
        },
        {
            id: "inventory",
            label: "Inventory",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            action: () => {
                dispatch(resetFilters());
                // Assuming we look for 'Inventory' category or tags later, for now 'Procurement' is close or just general
                dispatch(setFilterCategory("Procurement"));
            },
            isActive: filterCategory === "Procurement",
        },
        {
            id: "archived",
            label: "Archived",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            action: () => {
                dispatch(resetFilters());
                dispatch(setFilterStatus("Archived"));
            },
            isActive: filterStatus === "Archived",
        },
    ];

    return (
        <div className="w-64 bg-white border-r flex-shrink-0 hidden lg:block">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">INVS</h2>
            </div>

            <nav className="px-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.action}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${item.isActive
                                ? "bg-orange-50 text-orange-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="px-6 mt-8">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Filtered Views
                </p>
                <button
                    onClick={() => {
                        dispatch(resetFilters());
                        // Just a placeholder for Favorites logic
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Favorites
                </button>
            </div>
        </div>
    );
}
