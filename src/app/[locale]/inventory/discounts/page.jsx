// src/app/[locale]/inventory/discounts/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Percent,
    Plus,
    Search,
    Filter,
    RefreshCw,
    Grid,
    List,
    Tag,
    TrendingUp,
    Calendar,
    Loader2,
    AlertCircle
} from "lucide-react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import { DiscountCard, DiscountFormModal } from "@/components/inventory/discounts";
import {
    getDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus
} from "@/services/discountService";

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [message, setMessage] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    // In a real app, get this from your auth context/store
    const companyId = typeof window !== 'undefined'
        ? localStorage.getItem('companyId') || 'demo-company'
        : 'demo-company';

    useEffect(() => {
        fetchDiscounts();
    }, [page, rowsPerPage, filterStatus, filterType]);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const result = await getDiscounts({
                companyId,
                page: page + 1,
                limit: rowsPerPage,
                status: filterStatus !== "all" ? filterStatus : undefined,
                type: filterType !== "all" ? filterType : undefined
            });
            setDiscounts(result?.data || []);
            setTotal(result?.pagination?.total || 0);
        } catch (err) {
            console.log("Using placeholder data");
            // Placeholder data for demo
            setDiscounts([
                {
                    _id: "1",
                    name: "Summer Sale",
                    type: "percentage",
                    value: 20,
                    code: "SUMMER20",
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "active",
                    appliedProducts: ["p1", "p2", "p3"]
                },
                {
                    _id: "2",
                    name: "Flash $10 Off",
                    type: "fixed",
                    value: 10,
                    code: "FLASH10",
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "active"
                },
                {
                    _id: "3",
                    name: "BOGO Deal",
                    type: "bogo",
                    value: 1,
                    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "inactive"
                },
            ]);
            setTotal(3);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        setSaving(true);
        setMessage(null);
        try {
            if (selectedDiscount) {
                await updateDiscount(selectedDiscount._id, { ...formData, companyId });
                setMessage({ type: "success", text: "Discount updated successfully!" });
            } else {
                await createDiscount({ ...formData, companyId });
                setMessage({ type: "success", text: "Discount created successfully!" });
            }
            setShowModal(false);
            setSelectedDiscount(null);
            fetchDiscounts();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to save discount" });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (discount) => {
        setSelectedDiscount(discount);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this discount?")) return;

        try {
            await deleteDiscount(id);
            setMessage({ type: "success", text: "Discount deleted successfully!" });
            fetchDiscounts();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to delete discount" });
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleDiscountStatus(id);
            fetchDiscounts();
        } catch (err) {
            // Fallback: toggle locally for demo
            setDiscounts(discounts.map(d =>
                d._id === id
                    ? { ...d, status: d.status === "active" ? "inactive" : "active" }
                    : d
            ));
        }
    };

    const filteredDiscounts = discounts.filter(d => {
        const matchesSearch = searchTerm === "" ||
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const stats = {
        total: discounts.length,
        active: discounts.filter(d => d.status === "active").length,
        expired: discounts.filter(d => d.endDate && new Date(d.endDate) < new Date()).length,
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", { dateStyle: "medium" });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Percent size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
                            <p className="text-gray-500">Manage product discounts and promotions</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedDiscount(null);
                            setShowModal(true);
                        }}
                        className="px-4 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Discount
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Tag size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Discounts</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Expired</p>
                            <p className="text-xl font-bold text-gray-900">{stats.expired}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Percent size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg. Discount</p>
                            <p className="text-xl font-bold text-gray-900">
                                {discounts.length > 0
                                    ? Math.round(discounts.reduce((acc, d) => acc + (d.value || 0), 0) / discounts.length)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                    <AlertCircle size={18} />
                    {message.text}
                </div>
            )}

            {/* Filters & View Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-1 gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search discounts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                        >
                            <option value="all">All Types</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                            <option value="bogo">BOGO</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchDiscounts}
                            className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-orange-600" : "text-gray-500"
                                    }`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-orange-600" : "text-gray-500"
                                    }`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                    <p className="text-gray-500 mt-3">Loading discounts...</p>
                </div>
            ) : filteredDiscounts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Percent size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No discounts found</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 px-4 py-2 text-orange-600 font-medium hover:bg-orange-50 rounded-lg transition-colors"
                    >
                        Create your first discount
                    </button>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDiscounts.map((discount) => (
                        <DiscountCard
                            key={discount._id}
                            discount={discount}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table size="small">
                        <TableHead>
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-semibold text-gray-700">Name</TableCell>
                                <TableCell className="font-semibold text-gray-700">Type</TableCell>
                                <TableCell className="font-semibold text-gray-700">Value</TableCell>
                                <TableCell className="font-semibold text-gray-700">Code</TableCell>
                                <TableCell className="font-semibold text-gray-700">Duration</TableCell>
                                <TableCell className="font-semibold text-gray-700">Status</TableCell>
                                <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDiscounts.map((discount) => (
                                <TableRow key={discount._id} hover>
                                    <TableCell>
                                        <span className="font-medium text-gray-900">{discount.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                            {discount.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-orange-600">
                                            {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {discount.code ? (
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {discount.code}
                                            </span>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}>
                                            {discount.status}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleEdit(discount)}
                                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(discount._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                Delete
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
                </div>
            )}

            {/* Create/Edit Modal */}
            <DiscountFormModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedDiscount(null);
                }}
                onSave={handleSave}
                discount={selectedDiscount}
                loading={saving}
            />
        </div>
    );
}
