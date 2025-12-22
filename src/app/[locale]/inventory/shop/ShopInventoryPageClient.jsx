"use client"

import React, { useState } from "react"
import { Plus, RefreshCw, Search, AlertCircle, Loader2 } from "lucide-react"
import Skeleton from "@/components/shared/Skeleton"
import { ShopInventoryFormModal } from "@/components/inventory/shop"
import { getShopInventory, updateShopInventory } from "@/services/shopInventoryService"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export default function ShopInventoryPageClient() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterLow, setFilterLow] = useState("all")
    const [showModal, setShowModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [message, setMessage] = useState(null)

    const { data: session } = useSession();
    const user = session?.user;
    const userShopId = user?.shops?.[0];
    const shopId = typeof window !== "undefined" ? localStorage.getItem("shopId") || userShopId || "demo-shop" : userShopId || "demo-shop";

    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    const { data: inventoryRes, isLoading: loading, refetch: fetchItems } = useQuery({
        queryKey: ['shop-inventory', shopId],
        queryFn: () => getShopInventory({ shopId }, options),
        enabled: !!shopId,
    });

    const items = inventoryRes?.data || [];

    const handleSave = async (data) => {
        setMessage(null)
        try {
            if (selectedItem) {
                await updateShopInventory(selectedItem._id, data)
                setMessage({ type: "success", text: "Inventory updated" })
            } else {
                // For demo, we just push to local state
                // Note: In a real app, this would be a POST request
                setMessage({ type: "success", text: "Inventory added" })
            }
            setShowModal(false)
            setSelectedItem(null)
            fetchItems()
        } catch (err) {
            setMessage({ type: "error", text: err.message })
        }
    }

    const handleDelete = (id) => {
        if (!confirm("Delete this inventory entry?")) return
        // In a real app, this would be a DELETE request
        setMessage({ type: "success", text: "Deleted" })
        fetchItems();
    }

    const toggleLowStock = async (id) => {
        const item = items.find((i) => i._id === id)
        if (!item) return
        try {
            await updateShopInventory(id, { lowStock: !item.lowStock })
            fetchItems();
        } catch { }
    }

    const filtered = items.filter((i) => {
        const matchesSearch = searchTerm === "" || i.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLow = filterLow === "all" || (filterLow === "low" && i.lowStock) || (filterLow === "ok" && !i.lowStock)
        return matchesSearch && matchesLow
    })

    const stats = {
        total: items.length,
        low: items.filter((i) => i.lowStock).length,
        ok: items.filter((i) => !i.lowStock).length
    }

    return (
        <div className="min-h-screen bg-white p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Plus size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Shop Inventory</h1>
                            <p className="text-gray-600">Manage stock for a specific shop location</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setSelectedItem(null); setShowModal(true) }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Low Stock</p>
                    <p className="text-2xl font-bold text-red-600">{stats.low}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Sufficient Stock</p>
                    <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    <AlertCircle size={16} className="inline mr-2" />
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <select
                        value={filterLow}
                        onChange={(e) => setFilterLow(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="ok">Sufficient</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchItems()} className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table size="small">
                        <TableHead>
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-semibold text-gray-700">Product</TableCell>
                                <TableCell className="font-semibold text-gray-700">SKU</TableCell>
                                <TableCell className="font-semibold text-gray-700">Qty</TableCell>
                                <TableCell className="font-semibold text-gray-700">Location</TableCell>
                                <TableCell className="font-semibold text-gray-700">Status</TableCell>
                                <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                                    <TableCell align="center">
                                        <div className="flex justify-center gap-2">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-8" />
                                            <Skeleton className="h-4 w-12" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    No inventory items found.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table size="small">
                        <TableHead>
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-semibold text-gray-700">Product</TableCell>
                                <TableCell className="font-semibold text-gray-700">SKU</TableCell>
                                <TableCell className="font-semibold text-gray-700">Qty</TableCell>
                                <TableCell className="font-semibold text-gray-700">Location</TableCell>
                                <TableCell className="font-semibold text-gray-700">Status</TableCell>
                                <TableCell align="center" className="font-semibold text-gray-700">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((item) => (
                                <TableRow key={item._id} hover>
                                    <TableCell>{item.product?.name || "-"}</TableCell>
                                    <TableCell>{item.product?.sku || "-"}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.lowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                            {item.lowStock ? "Low" : "Ok"}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <button onClick={() => toggleLowStock(item._id)} className="mr-2 text-gray-400 hover:text-orange-600 text-sm">
                                            {item.lowStock ? "Mark OK" : "Mark Low"}
                                        </button>
                                        <button onClick={() => { setSelectedItem(item); setShowModal(true) }} className="mr-2 text-gray-400 hover:text-orange-600 text-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-600 text-sm">
                                            Delete
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Modal */}
            <ShopInventoryFormModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedItem(null) }}
                onSave={handleSave}
                initialData={selectedItem}
                loading={loading}
            />
        </div>
    )
}
