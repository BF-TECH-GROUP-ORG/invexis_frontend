"use client";

import React, { useState, useMemo } from "react";
import {
    Folder,
    ChevronRight,
    ArrowLeft,
    Calendar,
    Store,
    Users,
    Hash,
    Search,
    Clock,
    FileText
} from "lucide-react";
import {
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Box,
    Typography,
    InputAdornment,
    Button
} from "@mui/material";
import dayjs from "dayjs";
import InvoiceGenerator from "./InvoiceGenerator";
import InvoicePreviewModal from "./InvoicePreviewModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function InvoiceExplorer({ invoices, initialParams = {} }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const {
        shop: initialShop = "All",
        worker: initialWorker = "All",
        type: initialType = "All",
        startDate: initialStartDate = "",
        endDate: initialEndDate = "",
        view: initialView = "years",
        year: initialYear = null,
        month: initialMonth = null
    } = initialParams;

    // Sync state with URL params
    const selectedView = searchParams.get("view") || initialView;
    const currentYear = searchParams.get("year") || initialYear;
    const currentMonth = searchParams.get("month") || initialMonth;
    const selectedShop = searchParams.get("shop") || initialShop;
    const selectedWorker = searchParams.get("worker") || initialWorker;
    const selectedType = searchParams.get("type") || initialType;
    const startDate = searchParams.get("startDate") || initialStartDate;
    const endDate = searchParams.get("endDate") || initialEndDate;

    const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState(null);

    // Helper to update filters/state in URL
    const updateFilters = (updates) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "" || value === "All") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 1. Filtered Data Logic
    const filteredInvoices = useMemo(() => {
        return (invoices || []).filter(inv => {
            const dateMatch = (!startDate || dayjs(inv.date).isAfter(dayjs(startDate).subtract(1, 'day'))) &&
                (!endDate || dayjs(inv.date).isBefore(dayjs(endDate).add(1, 'day')));
            const shopMatch = selectedShop === "All" || (inv.shopName || "Default Shop") === selectedShop;
            const workerMatch = selectedWorker === "All" || (inv.workerName || "System") === selectedWorker;
            const typeMatch = selectedType === "All" || (inv.type || "Income") === selectedType;
            return dateMatch && shopMatch && workerMatch && typeMatch;
        });
    }, [invoices, startDate, endDate, selectedShop, selectedWorker, selectedType]);

    // 2. Group Data Logic
    const groupedData = useMemo(() => {
        const groups = {};
        filteredInvoices.forEach(inv => {
            const date = new Date(inv.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });

            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = [];

            groups[year][month].push(inv);
        });
        return groups;
    }, [filteredInvoices]);

    const years = Object.keys(groupedData).sort((a, b) => b - a);
    const shops = useMemo(() => ["All", ...new Set((invoices || []).map(inv => inv.shopName || "Default Shop"))], [invoices]);
    const workers = useMemo(() => ["All", ...new Set((invoices || []).map(inv => inv.workerName || "System"))], [invoices]);

    // Navigation Handlers
    const handleSelectYear = (year) => {
        updateFilters({ view: "months", year, month: null });
    };

    const handleSelectMonth = (month) => {
        updateFilters({ view: "list", month });
    };

    const handleBack = () => {
        if (selectedView === "list") {
            updateFilters({ view: "months", month: null });
        } else if (selectedView === "months") {
            updateFilters({ view: "years", year: null, month: null });
        }
    };

    // Breadcrumb
    const Breadcrumb = () => (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-8">
            <button
                onClick={() => updateFilters({ view: "years", year: null, month: null })}
                className="hover:text-indigo-600 transition-colors"
            >
                Archive Root
            </button>
            {currentYear && (
                <>
                    <ChevronRight size={12} className="text-slate-300" />
                    <button
                        onClick={() => updateFilters({ view: "months", month: null })}
                        className={`transition-colors ${selectedView === 'months' ? 'text-slate-900 border-b-2 border-indigo-500' : 'hover:text-indigo-600'}`}
                    >
                        FY {currentYear}
                    </button>
                </>
            )}
            {currentMonth && (
                <>
                    <ChevronRight size={12} className="text-slate-300" />
                    <span className="text-slate-900 border-b-2 border-indigo-500">{currentMonth}</span>
                </>
            )}
        </div>
    );

    const FilterBar = (
        <Stack direction="row" spacing={1.5} alignItems="center" mb={6} flexWrap="wrap" gap={1.5}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}><Store size={14} className="inline mr-1" /> Shop</InputLabel>
                <Select
                    label="Shop"
                    value={selectedShop}
                    onChange={(e) => updateFilters({ shop: e.target.value })}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    {shops.map(shop => <MenuItem key={shop} value={shop} sx={{ fontSize: '0.75rem' }}>{shop}</MenuItem>)}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}><Users size={14} className="inline mr-1" /> Worker</InputLabel>
                <Select
                    label="Worker"
                    value={selectedWorker}
                    onChange={(e) => updateFilters({ worker: e.target.value })}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    {workers.map(worker => <MenuItem key={worker} value={worker} sx={{ fontSize: '0.75rem' }}>{worker}</MenuItem>)}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}><Hash size={14} className="inline mr-1" /> Type</InputLabel>
                <Select
                    label="Type"
                    value={selectedType}
                    onChange={(e) => updateFilters({ type: e.target.value })}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Types</MenuItem>
                    <MenuItem value="Income" sx={{ fontSize: '0.75rem' }}>Income</MenuItem>
                    <MenuItem value="Expense" sx={{ fontSize: '0.75rem' }}>Expense</MenuItem>
                </Select>
            </FormControl>

            <TextField
                size="small"
                type="date"
                label="From"
                value={startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 130, "& .MuiInputBase-input": { fontSize: '0.75rem' }, "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
            />
            <TextField
                size="small"
                type="date"
                label="To"
                value={endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 130, "& .MuiInputBase-input": { fontSize: '0.75rem' }, "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
            />
        </Stack>
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Folder className="text-indigo-500" size={24} />
                        Invoice Repository
                    </h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Multi-dimensional document archive</p>
                </div>
                {selectedView !== "years" && (
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        startIcon={<ArrowLeft size={16} />}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            "&:hover": { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }
                        }}
                    >
                        Backward
                    </Button>
                )}
            </div>

            {FilterBar}

            <Breadcrumb />

            {/* VIEW: YEARS */}
            {selectedView === "years" && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => handleSelectYear(year)}
                            className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-500 hover:shadow-xl transition-all group scale-100 hover:scale-105"
                        >
                            <div className="p-4 rounded-full bg-white shadow-sm mb-4 group-hover:bg-indigo-50 transition-colors">
                                <Calendar size={32} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <span className="font-extrabold text-slate-700 text-lg group-hover:text-indigo-900">{year}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                                {Object.keys(groupedData[year]).length} Activity Months
                            </span>
                        </button>
                    ))}
                    {years.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
                        </div>
                    )}
                </div>
            )}

            {/* VIEW: MONTHS */}
            {selectedView === "months" && currentYear && groupedData[currentYear] && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {Object.keys(groupedData[currentYear]).map(month => (
                        <button
                            key={month}
                            onClick={() => handleSelectMonth(month)}
                            className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-500 hover:shadow-xl transition-all group scale-100 hover:scale-105"
                        >
                            <div className="p-4 rounded-full bg-white shadow-sm mb-4 group-hover:bg-blue-50 transition-colors">
                                <FileText size={32} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <span className="font-extrabold text-slate-700 text-lg group-hover:text-blue-900">{month}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                                {groupedData[currentYear][month].length} Documents
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* VIEW: LIST (Invoices) */}
            {selectedView === "list" && currentYear && currentMonth && groupedData[currentYear]?.[currentMonth] && (
                <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-right-4 duration-400">
                    {groupedData[currentYear][currentMonth].map(invoice => (
                        <InvoiceGenerator
                            key={invoice.id}
                            invoice={invoice}
                            onPreview={() => setSelectedPreviewInvoice(invoice)}
                        />
                    ))}
                    {groupedData[currentYear][currentMonth].length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">No documents matching filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            <InvoicePreviewModal
                invoice={selectedPreviewInvoice}
                open={!!selectedPreviewInvoice}
                onClose={() => setSelectedPreviewInvoice(null)}
            />
        </div>
    );
}
