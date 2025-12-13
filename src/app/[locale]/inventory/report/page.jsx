// src/app/[locale]/inventory/reports/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Download,
    Filter,
    Calendar,
    TrendingUp,
    Package,
    DollarSign,
    AlertTriangle,
    BarChart3,
    PieChart,
    RefreshCw,
    Plus,
    Eye,
    Loader2
} from "lucide-react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import {
    getReports,
    generateReport,
    getInventorySummary,
    getABCAnalysis,
    getStockMovement
} from "@/services/reportService";

const reportTypes = [
    { id: "inventory-summary", name: "Inventory Summary", icon: Package, color: "blue" },
    { id: "stock-movement", name: "Stock Movement", icon: TrendingUp, color: "green" },
    { id: "valuation", name: "Inventory Valuation", icon: DollarSign, color: "purple" },
    { id: "low-stock", name: "Low Stock Report", icon: AlertTriangle, color: "orange" },
    { id: "abc-analysis", name: "ABC Analysis", icon: PieChart, color: "pink" },
    { id: "aging", name: "Aging Inventory", icon: Calendar, color: "gray" },
];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [message, setMessage] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [summary, setSummary] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    // In a real app, get this from your auth context/store
    const companyId = typeof window !== 'undefined'
        ? localStorage.getItem('companyId') || 'demo-company'
        : 'demo-company';

    useEffect(() => {
        fetchReports();
        fetchSummary();
    }, [page, rowsPerPage]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const result = await getReports({
                companyId,
                page: page + 1,
                limit: rowsPerPage,
                type: selectedType || undefined
            });
            setReports(result?.data || []);
            setTotal(result?.pagination?.total || 0);
        } catch (err) {
            console.log("Using placeholder data");
            // Placeholder data for demo
            setReports([
                { _id: "1", name: "Monthly Inventory Summary", type: "inventory-summary", createdAt: new Date().toISOString(), status: "completed" },
                { _id: "2", name: "Stock Movement Q4", type: "stock-movement", createdAt: new Date().toISOString(), status: "completed" },
                { _id: "3", name: "Low Stock Alert Report", type: "low-stock", createdAt: new Date().toISOString(), status: "completed" },
            ]);
            setTotal(3);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const result = await getInventorySummary(companyId);
            setSummary(result?.data);
        } catch (err) {
            // Use placeholder
            setSummary({
                totalProducts: 1250,
                totalValue: 485000,
                lowStockCount: 23,
                turnoverRate: 4.2
            });
        }
    };

    const handleGenerateReport = async (type) => {
        setGenerating(true);
        setMessage(null);
        try {
            await generateReport({
                companyId,
                type,
                dateRange
            });
            setMessage({ type: "success", text: "Report generated successfully!" });
            fetchReports();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to generate report" });
        } finally {
            setGenerating(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            dateStyle: "medium",
        });
    };

    const getTypeColor = (type) => {
        const found = reportTypes.find(rt => rt.id === type);
        const colors = {
            blue: "bg-blue-100 text-blue-700",
            green: "bg-green-100 text-green-700",
            purple: "bg-purple-100 text-purple-700",
            orange: "bg-orange-100 text-orange-700",
            pink: "bg-pink-100 text-pink-700",
            gray: "bg-gray-100 text-gray-700",
        };
        return colors[found?.color || "gray"];
    };

    const summaryStats = [
        {
            title: "Total Products",
            value: summary?.totalProducts || 0,
            icon: Package,
            color: "blue",
        },
        {
            title: "Total Value",
            value: `$${(summary?.totalValue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "green",
        },
        {
            title: "Low Stock Items",
            value: summary?.lowStockCount || 0,
            icon: AlertTriangle,
            color: "orange",
        },
        {
            title: "Stock Turnover",
            value: `${(summary?.turnoverRate || 0).toFixed(1)}x`,
            icon: TrendingUp,
            color: "purple",
        },
    ];

    const colorClasses = {
        blue: { bg: "bg-blue-100", icon: "text-blue-600" },
        green: { bg: "bg-green-100", icon: "text-green-600" },
        orange: { bg: "bg-orange-100", icon: "text-orange-600" },
        purple: { bg: "bg-purple-100", icon: "text-purple-600" },
        pink: { bg: "bg-pink-100", icon: "text-pink-600" },
        gray: { bg: "bg-gray-100", icon: "text-gray-600" },
    };

    return (
        <div className="min-h-screen bg-white p-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <BarChart3 size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                            <p className="text-gray-500">Generate and view inventory reports</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchReports}
                            className="px-4 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {summaryStats.map((stat) => {
                    const Icon = stat.icon;
                    // Color mapping to match Ecommerce design
                    const colorMap = {
                        blue: { color: "#3b82f6", bgColor: "#eff6ff" },
                        green: { color: "#10b981", bgColor: "#f0fdf4" },
                        orange: { color: "#ff782d", bgColor: "#fff8f5" },
                        purple: { color: "#a855f7", bgColor: "#faf5ff" },
                        pink: { color: "#ec4899", bgColor: "#fdf2f8" },
                        gray: { color: "#6b7280", bgColor: "#f9fafb" },
                    };
                    const colors = colorMap[stat.color] || colorMap.gray;

                    return (
                        <div
                            key={stat.title}
                            className="border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all cursor-pointer hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-[#6b7280] font-medium mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-[#081422] mb-2">{stat.value}</p>
                                </div>
                                <div
                                    className="p-3 rounded-xl shrink-0"
                                    style={{ backgroundColor: colors.bgColor }}
                                >
                                    <Icon size={24} style={{ color: colors.color }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-300 mb-6">
                <div className="flex border-b border-gray-100">
                    {[
                        { id: "overview", label: "Overview" },
                        { id: "generate", label: "Generate Report" },
                        { id: "history", label: "Report History" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 font-medium transition-all ${activeTab === tab.id
                                ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Generate Cards */}
                    <div className="bg-white rounded-xl border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {reportTypes.slice(0, 4).map((type) => {
                                const Icon = type.icon;
                                const colors = colorClasses[type.color];
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => handleGenerateReport(type.id)}
                                        disabled={generating}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50/50 transition-colors text-left"
                                    >
                                        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-2`}>
                                            <Icon size={20} className={colors.icon} />
                                        </div>
                                        <p className="font-medium text-gray-900 text-sm">{type.name}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div className="bg-white rounded-xl border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                        {loading ? (
                            <div className="py-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                            </div>
                        ) : reports.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No reports generated yet</p>
                        ) : (
                            <div className="space-y-3">
                                {reports.slice(0, 5).map((report) => (
                                    <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{report.name}</p>
                                                <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "generate" && (
                <div className="bg-white rounded-xl border border-gray-300 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Generate New Report</h3>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Report Type Selection */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {reportTypes.map((type) => {
                            const Icon = type.icon;
                            const colors = colorClasses[type.color];
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleGenerateReport(type.id)}
                                    disabled={generating}
                                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all text-left group disabled:opacity-50"
                                >
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} className={colors.icon} />
                                    </div>
                                    <p className="font-semibold text-gray-900">{type.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">Generate report</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === "history" && (
                <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Report History</h3>
                            <select
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value);
                                    setPage(0);
                                }}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="">All Types</option>
                                {reportTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                            <p className="text-gray-500 mt-3">Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No reports found</p>
                        </div>
                    ) : (
                        <>
                            <Table size="small">
                                <TableHead>
                                    <TableRow className="bg-gray-50">
                                        <TableCell className="font-semibold text-gray-700">Report Name</TableCell>
                                        <TableCell className="font-semibold text-gray-700">Type</TableCell>
                                        <TableCell className="font-semibold text-gray-700">Created</TableCell>
                                        <TableCell className="font-semibold text-gray-700">Status</TableCell>
                                        <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report._id} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <span className="font-medium text-gray-900">{report.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                                                    {reportTypes.find(rt => rt.id === report.type)?.name || report.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-gray-600">{formatDate(report.createdAt)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a href={`/inventory/report/${report._id}`} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                                                        <Eye size={16} />
                                                    </a>
                                                    <button className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="p-2 flex justify-end border-t border-gray-100">
                                <TablePagination
                                    component="div"
                                    count={total}
                                    page={page}
                                    onPageChange={(e, newPage) => setPage(newPage)}
                                    rowsPerPage={rowsPerPage}
                                    rowsPerPageOptions={[10, 25, 50]}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setPage(0);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}