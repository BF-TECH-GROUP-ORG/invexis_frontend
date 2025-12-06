// src/components/inventory/products/SimpleProductForm.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Upload, X, Plus, Trash2 } from "lucide-react";

export default function SimpleProductForm({
    formData,
    updateFormData,
    errors,
    categories = [],
    isLoadingCategories = false,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
}) {
    const [activeSlide, setActiveSlide] = useState(0);

    const pricing = formData.pricing || { basePrice: "", currency: "USD" };
    const inventory = formData.inventory || { trackQuantity: true, allowBackorder: false, lowStockThreshold: 10 };
    const attributes = formData.attributes || [];

    const handlePriceChange = (field, value) => {
        updateFormData({ pricing: { ...pricing, [field]: value } });
    };

    const handleInventoryChange = (field, value) => {
        updateFormData({ inventory: { ...inventory, [field]: value } });
    };

    const nextSlide = () => setActiveSlide(1);
    const prevSlide = () => setActiveSlide(0);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="w-full">
            {/* Slide Indicator - Clear and Labeled */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {/* Slide 1 Indicator */}
                <button
                    onClick={() => setActiveSlide(0)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSlide === 0
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeSlide === 0 ? "bg-white text-orange-500" : "bg-gray-300 text-gray-600"
                        }`}>
                        1
                    </div>
                    <span className="font-semibold text-sm">Product Details</span>
                </button>

                {/* Connector Line */}
                <div className={`h-0.5 w-12 transition-all ${activeSlide === 1 ? "bg-orange-500" : "bg-gray-300"}`} />

                {/* Slide 2 Indicator */}
                <button
                    onClick={() => setActiveSlide(1)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSlide === 1
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeSlide === 1 ? "bg-white text-orange-500" : "bg-gray-300 text-gray-600"
                        }`}>
                        2
                    </div>
                    <span className="font-semibold text-sm">Pricing & Inventory</span>
                </button>
            </div>

            <div className="w-full min-h-[500px]">
                <AnimatePresence initial={false} custom={activeSlide} mode="wait">
                    {activeSlide === 0 ? (
                        <motion.div
                            key="slide1"
                            custom={activeSlide}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.name || ""}
                                            onChange={(e) => updateFormData({ name: e.target.value })}
                                            className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="Enter product name"
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Brand */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Brand <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.brand || ""}
                                            onChange={(e) => updateFormData({ brand: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            placeholder="Enter brand"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category || ""}
                                            onChange={(e) => updateFormData({ category: e.target.value })}
                                            disabled={isLoadingCategories}
                                            className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.category ? "border-red-500" : "border-gray-300"}`}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                    </div>

                                    {/* Supplier */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Supplier</label>
                                        <input
                                            value={formData.supplier || ""}
                                            onChange={(e) => updateFormData({ supplier: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            placeholder="Enter supplier name"
                                        />
                                    </div>

                                    {/* Manufacturer */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Manufacturer</label>
                                        <input
                                            value={formData.manufacturer || ""}
                                            onChange={(e) => updateFormData({ manufacturer: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            placeholder="Enter manufacturer"
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tags</label>
                                        <input
                                            value={(formData.tags || []).join(", ")}
                                            onChange={(e) =>
                                                updateFormData({
                                                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                                })
                                            }
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            placeholder="e.g. organic, cotton, eco-friendly"
                                        />
                                    </div>

                                    {/* Short Description */}
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Short Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.description?.short || ""}
                                            onChange={(e) =>
                                                updateFormData({ description: { ...formData.description, short: e.target.value } })
                                            }
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                                            placeholder="Brief product summary..."
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={nextSlide}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                                    >
                                        Next: Pricing & Inventory
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="slide2"
                            custom={activeSlide}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Base Price */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Base Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-sm text-gray-500">
                                                {pricing.currency === "FRW" ? "Frw" :
                                                    pricing.currency === "KES" ? "KSh" :
                                                        pricing.currency === "EUR" ? "€" :
                                                            pricing.currency === "GBP" ? "£" : "$"}
                                            </span>
                                            <input
                                                type="number"
                                                value={pricing.basePrice}
                                                onChange={(e) => handlePriceChange("basePrice", e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.price ? "border-red-500" : "border-gray-300"}`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                                    </div>

                                    {/* Sale Price */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Sale Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-sm text-gray-500">
                                                {pricing.currency === "FRW" ? "Frw" :
                                                    pricing.currency === "KES" ? "KSh" :
                                                        pricing.currency === "EUR" ? "€" :
                                                            pricing.currency === "GBP" ? "£" : "$"}
                                            </span>
                                            <input
                                                type="number"
                                                value={pricing.salePrice || ""}
                                                onChange={(e) => handlePriceChange("salePrice", e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Cost */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Cost</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-sm text-gray-500">
                                                {pricing.currency === "FRW" ? "Frw" :
                                                    pricing.currency === "KES" ? "KSh" :
                                                        pricing.currency === "EUR" ? "€" :
                                                            pricing.currency === "GBP" ? "£" : "$"}
                                            </span>
                                            <input
                                                type="number"
                                                value={pricing.cost || ""}
                                                onChange={(e) => handlePriceChange("cost", e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Currency</label>
                                        <select
                                            value={pricing.currency}
                                            onChange={(e) => handlePriceChange("currency", e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="FRW">FRW</option>
                                            <option value="KES">KES</option>
                                        </select>
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={inventory.quantity || ""}
                                            onChange={(e) => handleInventoryChange("quantity", e.target.value)}
                                            className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.stock ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="0"
                                        />
                                        {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                                    </div>

                                    {/* Low Stock Threshold */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Low Stock Alert</label>
                                        <input
                                            type="number"
                                            value={inventory.lowStockThreshold || ""}
                                            onChange={(e) => handleInventoryChange("lowStockThreshold", e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            placeholder="10"
                                        />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={inventory.trackQuantity}
                                            onChange={(e) => handleInventoryChange("trackQuantity", e.target.checked)}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">Track Quantity</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={inventory.allowBackorder}
                                            onChange={(e) => handleInventoryChange("allowBackorder", e.target.checked)}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">Allow Backorder</span>
                                    </label>
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-3">Product Images</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {(formData.images || []).map((img, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square rounded-lg border-2 border-gray-200 overflow-hidden group hover:border-orange-300 transition"
                                            >
                                                {img.url?.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                                    <video src={img.url} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                )}

                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={12} />
                                                </button>

                                                {img.isPrimary && (
                                                    <div className="absolute bottom-0 w-full text-center text-xs bg-orange-500 text-white py-1 font-medium">
                                                        Primary
                                                    </div>
                                                )}

                                                {!img.isPrimary && (
                                                    <button
                                                        onClick={() => setPrimaryImage(index)}
                                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 bg-white border border-gray-300 rounded opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        Set Primary
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {(formData.images || []).length < 10 && (
                                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
                                                <Upload size={20} className="text-gray-400" />
                                                <span className="text-xs text-gray-500 mt-1">Upload</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,video/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Attributes */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-3">Product Attributes</label>
                                    <div className="space-y-2">
                                        {attributes.map((attr, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={attr.name}
                                                    onChange={(e) =>
                                                        updateFormData({
                                                            attributes: attributes.map((a, i) =>
                                                                i === index ? { ...a, name: e.target.value } : a
                                                            )
                                                        })
                                                    }
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                                    placeholder="Attribute name"
                                                />

                                                <input
                                                    type="text"
                                                    value={attr.value}
                                                    onChange={(e) =>
                                                        updateFormData({
                                                            attributes: attributes.map((a, i) =>
                                                                i === index ? { ...a, value: e.target.value } : a
                                                            )
                                                        })
                                                    }
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition"
                                                    placeholder="Value"
                                                />

                                                <button
                                                    onClick={() =>
                                                        updateFormData({
                                                            attributes: attributes.filter((_, i) => i !== index)
                                                        })
                                                    }
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() =>
                                            updateFormData({
                                                attributes: [...attributes, { name: "", value: "" }]
                                            })
                                        }
                                        className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1.5 font-medium"
                                    >
                                        <Plus size={16} /> Add Attribute
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
