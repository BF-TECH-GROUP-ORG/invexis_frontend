"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Printer,
    Download,
    FileText,
    Calendar,
    User,
    Package,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Loader2
} from "lucide-react";
import { getReportById } from "@/services/reportService";

// Mock data generator for demo purposes if backend returns empty details
const generateMockDetails = (type, id) => {
    const items = [];
    const count = 15;

    for (let i = 0; i < count; i++) {
        if (type === 'inventory-summary') {
            items.push({
                id: i,
                sku: `SKU-${1000 + i}`,
                name: `Product Item ${i + 1}`,
                category: i % 3 === 0 ? 'Electronics' : i % 3 === 1 ? 'Clothing' : 'Home',
                quantity: Math.floor(Math.random() * 100),
                unitPrice: (Math.random() * 50 + 10).toFixed(2),
                totalValue: (Math.random() * 5000 + 100).toFixed(2),
                status: Math.random() > 0.2 ? 'Active' : 'Low Stock'
            });
        }
        else if (type === 'stock-movement') {
            items.push({
                id: i,
                date: new Date(Date.now() - i * 86400000).toISOString(),
                product: `Product Item ${i + 1}`,
                type: Math.random() > 0.5 ? 'IN' : 'OUT',
                quantity: Math.floor(Math.random() * 20) + 1,
                reason: Math.random() > 0.5 ? 'Purchase Order' : 'Sales Order',
                user: 'Admin User'
            });
        }
        else if (type === 'low-stock') {
            items.push({
                id: i,
                sku: `SKU-${2000 + i}`,
                name: `Low Stock Item ${i + 1}`,
                currentStock: Math.floor(Math.random() * 5),
                minLevel: 10,
                supplier: 'Supplier ABC',
                lastOrdered: new Date(Date.now() - i * 90000000).toISOString()
            });
        }
        else {
            items.push({
                id: i,
                col1: `Data ${i}-1`,
                col2: `Data ${i}-2`,
                col3: `Data ${i}-3`,
                col4: `Data ${i}-4`
            });
        }
    }
    return items;
};

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (params.id) {
            fetchReportDetails(params.id);
        }
    }, [params.id]);

    const fetchReportDetails = async (id) => {
        setLoading(true);
        try {
            // Try to get real report
            let data;
            try {
                data = await getReportById(id);
            } catch (err) {
                console.warn("Backend fetch failed, falling back to mock");
            }

            // If no data or just basic data, enhance with mock details for the "Report Card" view
            if (!data || !data.details) {
                // Simulate fetch delay
                await new Promise(r => setTimeout(r, 800));

                // Determine type from ID or random if strictly mock
                const mockType = id === '1' ? 'inventory-summary' :
                    id === '2' ? 'stock-movement' :
                        id === '3' ? 'low-stock' : 'inventory-summary';

                const mockName = mockType === 'inventory-summary' ? 'Monthly Inventory Summary' :
                    mockType === 'stock-movement' ? 'Stock Movement Report' :
                        'Low Stock Alert Report';

                data = {
                    _id: id,
                    name: mockName,
                    type: mockType,
                    createdAt: new Date().toISOString(),
                    generatedBy: "Admin User",
                    period: "Last 30 Days",
                    status: "Completed",
                    details: generateMockDetails(mockType, id),
                    summary: {
                        totalItems: 145,
                        totalValue: 24500.00,
                        generatedAt: new Date().toISOString()
                    }
                };
            }
            setReport(data);
        } catch (err) {
            setError("Failed to load report details");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            dateStyle: "medium",
            ...(includeTime && { timeStyle: "short" })
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500 mb-4" />
                    <p className="text-gray-500">Loading report details...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
                    <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
                    <p className="text-gray-500 mb-6">{error || "Report not found"}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
            {/* Header - Hidden in Print */}
            <div className="mb-6 flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Reports</span>
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <Printer size={18} />
                        <span>Print Report</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm transition-all shadow-orange-200">
                        <Download size={18} />
                        <span>Generic PDF</span>
                    </button>
                </div>
            </div>

            {/* Report Card */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:max-w-none">

                {/* Report Header */}
                <div className="bg-orange-600 p-8 text-white print:bg-white print:text-black print:border-b print:border-gray-300 print:p-0 print:mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <FileText size={28} className="text-white/90 print:text-orange-600" />
                                <h1 className="text-3xl font-bold">{report.name}</h1>
                            </div>
                            <p className="text-orange-100 print:text-gray-500 text-lg">
                                {report.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Report
                            </p>
                        </div>
                        <div className="text-right text-orange-50 print:text-gray-600">
                            <div className="flex items-center justify-end gap-2 mb-1">
                                <Calendar size={16} />
                                <span>Generated: {formatDate(report.createdAt, true)}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <User size={16} />
                                <span>By: {report.generatedBy}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Summary Cards */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 print:bg-white print:p-0 print:mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4">
                        <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm print:border-gray-200 print:shadow-none">
                            <p className="text-sm text-gray-500 mb-1">Total Items</p>
                            <p className="text-2xl font-bold text-gray-900">{report.summary?.totalItems || report.details.length}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm print:border-gray-200 print:shadow-none">
                            <p className="text-sm text-gray-500 mb-1">Period</p>
                            <p className="text-lg font-bold text-gray-900">{report.period || "All Time"}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm print:border-gray-200 print:shadow-none">
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 print:bg-transparent print:text-black print:px-0 print:text-lg print:font-bold">
                                {report.status}
                            </span>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm print:border-gray-200 print:shadow-none">
                            <p className="text-sm text-gray-500 mb-1">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.summary?.totalValue || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Report Content Table */}
                <div className="p-8 print:p-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 print:mb-2">Report Details</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    {report.type === 'inventory-summary' && (
                                        <>
                                            <th className="py-3 px-4 font-semibold text-gray-900 w-16">#</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">SKU</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Product Name</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Category</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900 text-right">Quantity</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900 text-right">Unit Price</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900 text-right">Total Value</th>
                                        </>
                                    )}
                                    {report.type === 'stock-movement' && (
                                        <>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Date</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Product</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Type</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Reason</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900 text-right">Qty</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">User</th>
                                        </>
                                    )}
                                    {report.type === 'low-stock' && (
                                        <>
                                            <th className="py-3 px-4 font-semibold text-gray-900">SKU</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Product Name</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900 text-right">Current Stock</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900 text-right">Min Level</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Supplier</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Last Ordered</th>
                                        </>
                                    )}
                                    {!['inventory-summary', 'stock-movement', 'low-stock'].includes(report.type) && (
                                        <>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Item</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Detail 1</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Detail 2</th>
                                            <th className="py-3 px-4 font-semibold text-gray-900">Detail 3</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {report.details.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                                        {report.type === 'inventory-summary' && (
                                            <>
                                                <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                                                <td className="py-3 px-4 text-gray-900 font-medium">{item.sku}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-900 text-right font-medium">{item.quantity}</td>
                                                <td className="py-3 px-4 text-gray-600 text-right">${item.unitPrice}</td>
                                                <td className="py-3 px-4 text-gray-900 text-right font-bold">${item.totalValue}</td>
                                            </>
                                        )}
                                        {report.type === 'stock-movement' && (
                                            <>
                                                <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(item.date, true)}</td>
                                                <td className="py-3 px-4 text-gray-900 font-medium">{item.product}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{item.reason}</td>
                                                <td className={`py-3 px-4 text-right font-bold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {item.type === 'IN' ? '+' : '-'}{item.quantity}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{item.user}</td>
                                            </>
                                        )}
                                        {report.type === 'low-stock' && (
                                            <>
                                                <td className="py-3 px-4 text-gray-900 font-medium">{item.sku}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.name}</td>
                                                <td className="py-3 px-4 text-red-600 text-right font-bold">{item.currentStock}</td>
                                                <td className="py-3 px-4 text-gray-600 text-right">{item.minLevel}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.supplier}</td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(item.lastOrdered)}</td>
                                            </>
                                        )}
                                        {!['inventory-summary', 'stock-movement', 'low-stock'].includes(report.type) && (
                                            <>
                                                <td className="py-3 px-4 text-gray-900 font-medium">{item.col1}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.col2}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.col3}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.col4}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 p-6 print:bg-white print:border-t-2 print:border-gray-800">
                    <div className="flex justify-between items-center text-sm text-gray-500 print:text-xs">
                        <p>Generated by Invexis Inventory System</p>
                        <p>Page 1 of 1</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
