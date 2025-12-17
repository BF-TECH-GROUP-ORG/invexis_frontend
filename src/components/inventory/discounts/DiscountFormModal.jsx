// src/components/inventory/discounts/DiscountFormModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Percent, DollarSign, Calendar, Tag, Loader2 } from "lucide-react";

const discountTypes = [
    { id: "percentage", label: "Percentage", icon: Percent, suffix: "%" },
    { id: "fixed", label: "Fixed Amount", icon: DollarSign, suffix: "$" },
    { id: "bogo", label: "Buy One Get One", icon: Tag, suffix: "" },
];

export default function DiscountFormModal({
    isOpen,
    onClose,
    onSave,
    discount = null,
    loading = false
}) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "percentage",
        value: "",
        code: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        minPurchase: "",
        maxDiscount: "",
        usageLimit: "",
        status: "active",
    });

    useEffect(() => {
        if (discount) {
            setFormData({
                name: discount.name || "",
                description: discount.description || "",
                type: discount.type || "percentage",
                value: discount.value || "",
                code: discount.code || "",
                startDate: discount.startDate ? discount.startDate.split('T')[0] : "",
                endDate: discount.endDate ? discount.endDate.split('T')[0] : "",
                minPurchase: discount.minPurchase || "",
                maxDiscount: discount.maxDiscount || "",
                usageLimit: discount.usageLimit || "",
                status: discount.status || "active",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                type: "percentage",
                value: "",
                code: "",
                startDate: new Date().toISOString().split('T')[0],
                endDate: "",
                minPurchase: "",
                maxDiscount: "",
                usageLimit: "",
                status: "active",
            });
        }
    }, [discount, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Percent size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {discount ? "Edit Discount" : "Create Discount"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {discount ? "Update discount details" : "Add a new discount"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Summer Sale 20%"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description..."
                            rows={2}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-none"
                        />
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount Type *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {discountTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.id })}
                                        className={`p-3 rounded-lg border text-center transition-all ${formData.type === type.id
                                                ? "border-orange-400 bg-orange-50 text-orange-700"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            }`}
                                    >
                                        <Icon size={18} className="mx-auto mb-1" />
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Value *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max={formData.type === "percentage" ? 100 : undefined}
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder="e.g., 20"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {formData.type === "percentage" ? "%" : formData.type === "fixed" ? "$" : ""}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SUMMER20"
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={generateCode}
                                    className="px-3 py-2.5 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Optional Settings */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Min. Purchase ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.minPurchase}
                                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Max. Discount ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.maxDiscount}
                                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                placeholder="None"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Usage Limit
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                placeholder="Unlimited"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.name || !formData.value}
                        className="px-4 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {discount ? "Update Discount" : "Create Discount"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
