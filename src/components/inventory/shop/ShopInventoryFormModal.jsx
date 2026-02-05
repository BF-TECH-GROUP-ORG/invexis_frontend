// src/components/inventory/shop/ShopInventoryFormModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Search, Check } from "lucide-react";
import { getProducts } from "@/services/productsService";

export default function ShopInventoryFormModal({
    isOpen = false,
    onClose = () => { },
    onSave = () => { },
    initialData = null,
    loading = false,
}) {
    const [form, setForm] = useState({
        productId: "",
        quantity: "",
        location: "",
    });

    // Product Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const companyId = typeof window !== "undefined" ? localStorage.getItem("companyId") || "demo-company" : "demo-company";

    useEffect(() => {
        if (initialData) {
            setForm({
                productId: initialData.product?._id || "",
                quantity: initialData.quantity || "",
                location: initialData.location || "",
            });
            setSelectedProduct(initialData.product);
            setSearchTerm(initialData.product?.name || "");
        } else {
            setForm({ productId: "", quantity: "", location: "" });
            setSelectedProduct(null);
            setSearchTerm("");
        }
    }, [initialData]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            // Only search if not already selected (to avoid re-searching when clicking a result)
            // or if the user is actively typing a new term
            if (searchTerm && (!selectedProduct || selectedProduct.name !== searchTerm)) {
                setSearching(true);
                try {
                    const res = await getProducts({
                        search: searchTerm,
                        companyId,
                        limit: 5
                    });
                    setProducts(res.data || []);
                    setShowResults(true);
                } catch (err) {
                    console.error("Failed to search products", err);
                    setProducts([]);
                } finally {
                    setSearching(false);
                }
            } else if (!searchTerm) {
                setProducts([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, companyId, selectedProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (product) => {
        setForm(prev => ({ ...prev, productId: product._id }));
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setShowResults(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            quantity: Number(form.quantity),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {initialData ? "Edit Inventory" : "Add Inventory"}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Product Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedProduct && e.target.value !== selectedProduct.name) {
                                        setSelectedProduct(null); // Clear selection on edit
                                        setForm(prev => ({ ...prev, productId: "" }));
                                    }
                                    setShowResults(true);
                                }}
                                onFocus={() => searchTerm && setShowResults(true)}
                                placeholder="Search product by name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required={!form.productId} // Required if no ID set
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            {searching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="animate-spin text-orange-500" size={16} />
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && products.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {products.map((product) => (
                                    <button
                                        key={product._id}
                                        type="button"
                                        onClick={() => handleProductSelect(product)}
                                        className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                        </div>
                                        {selectedProduct?._id === product._id && (
                                            <Check size={16} className="text-orange-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showResults && products.length === 0 && searchTerm && !searching && !selectedProduct && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
                                No products found
                            </div>
                        )}
                    </div>

                    {selectedProduct && (
                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                {selectedProduct.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-orange-900">{selectedProduct.name}</p>
                                <p className="text-xs text-orange-700">ID: {selectedProduct._id}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
