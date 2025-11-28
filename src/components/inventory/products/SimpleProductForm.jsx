// src/components/inventory/products/SimpleProductForm.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";

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
        updateFormData({
            pricing: { ...pricing, [field]: value },
        });
    };

    const handleInventoryChange = (field, value) => {
        updateFormData({
            inventory: { ...inventory, [field]: value },
        });
    };

    const handleAddAttribute = () => {
        updateFormData({ attributes: [...attributes, { name: "", value: "" }] });
    };

    const handleRemoveAttribute = (index) => {
        const newAttributes = attributes.filter((_, i) => i !== index);
        updateFormData({ attributes: newAttributes });
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = value;
        updateFormData({ attributes: newAttributes });
    };

    const nextSlide = () => setActiveSlide(1);
    const prevSlide = () => setActiveSlide(0);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="h-full flex flex-col">
            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mb-4">
                <div className={`h-1.5 w-8 rounded-full transition-colors ${activeSlide === 0 ? "bg-orange-500" : "bg-gray-200"}`} />
                <div className={`h-1.5 w-8 rounded-full transition-colors ${activeSlide === 1 ? "bg-orange-500" : "bg-gray-200"}`} />
            </div>

            <div className="flex-1 relative overflow-hidden min-h-[400px]">
                <AnimatePresence initial={false} custom={activeSlide} mode="wait">
                    {activeSlide === 0 ? (
                        <motion.div
                            key="slide1"
                            custom={activeSlide}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="absolute inset-0 p-1 overflow-y-auto"
                        >
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.name || ""}
                                            onChange={(e) => updateFormData({ name: e.target.value })}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-orange-500 outline-none ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="Product Name"
                                        />
                                        {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Brand <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.brand || ""}
                                            onChange={(e) => updateFormData({ brand: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                            placeholder="Brand Name"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                        <select
                                            value={formData.category || ""}
                                            onChange={(e) => updateFormData({ category: e.target.value })}
                                            disabled={isLoadingCategories}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-orange-500 outline-none ${errors.category ? "border-red-500" : "border-gray-300"}`}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-[10px] mt-0.5">{errors.category}</p>}
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Manufacturer</label>
                                        <input
                                            type="text"
                                            value={formData.manufacturer || ""}
                                            onChange={(e) => updateFormData({ manufacturer: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                            placeholder="Manufacturer"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Tags</label>
                                        <input
                                            type="text"
                                            value={(formData.tags || []).join(", ")}
                                            onChange={(e) => updateFormData({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                            placeholder="e.g. organic, cotton"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.description?.short || ""}
                                            onChange={(e) => updateFormData({ description: { ...formData.description, short: e.target.value } })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                            placeholder="Brief summary..."
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Long Description</label>
                                        <textarea
                                            value={formData.description?.long || ""}
                                            onChange={(e) => updateFormData({ description: { ...formData.description, long: e.target.value } })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none h-20 resize-none"
                                            placeholder="Detailed description..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={nextSlide}
                                        className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
                                    >
                                        Next: Pricing & Inventory <ChevronRight size={16} />
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
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="absolute inset-0 p-1 overflow-y-auto"
                        >
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
                                    <button
                                        onClick={prevSlide}
                                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        <ChevronLeft size={14} /> Back to Details
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500 text-xs">{pricing.currency === "RWF" ? "Frw" : "$"}</span>
                                            <input
                                                type="number"
                                                value={pricing.basePrice}
                                                onChange={(e) => handlePriceChange("basePrice", e.target.value)}
                                                className={`w-full pl-6 pr-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-orange-500 outline-none ${errors.price ? "border-red-500" : "border-gray-300"}`}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        {errors.price && <p className="text-red-500 text-[10px] mt-0.5">{errors.price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Sale Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500 text-xs">{pricing.currency === "RWF" ? "Frw" : "$"}</span>
                                            <input
                                                type="number"
                                                value={pricing.salePrice || ""}
                                                onChange={(e) => handlePriceChange("salePrice", e.target.value)}
                                                className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Cost</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500 text-xs">{pricing.currency === "RWF" ? "Frw" : "$"}</span>
                                            <input
                                                type="number"
                                                value={pricing.cost || ""}
                                                onChange={(e) => handlePriceChange("cost", e.target.value)}
                                                className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={inventory.quantity !== undefined ? inventory.quantity : ""}
                                            onChange={(e) => handleInventoryChange("quantity", e.target.value)}
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-orange-500 outline-none ${errors.stock ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.stock && <p className="text-red-500 text-[10px] mt-0.5">{errors.stock}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Low Stock</label>
                                        <input
                                            type="number"
                                            value={inventory.lowStockThreshold || ""}
                                            onChange={(e) => handleInventoryChange("lowStockThreshold", e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                                            placeholder="10"
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex flex-col justify-center gap-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inventory.trackQuantity}
                                                onChange={(e) => handleInventoryChange("trackQuantity", e.target.checked)}
                                                className="w-3.5 h-3.5 text-orange-500 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-xs font-medium text-gray-700">Track Qty</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inventory.allowBackorder}
                                                onChange={(e) => handleInventoryChange("allowBackorder", e.target.checked)}
                                                className="w-3.5 h-3.5 text-orange-500 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-xs font-medium text-gray-700">Backorder</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Attributes Section */}
                                <div className="border-t pt-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Attributes</label>
                                    {attributes.map((attr, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={attr.name}
                                                onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
                                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                                placeholder="Name"
                                            />
                                            <input
                                                type="text"
                                                value={attr.value}
                                                onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                                placeholder="Value"
                                            />
                                            <button onClick={() => handleRemoveAttribute(index)} className="text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddAttribute} className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                        <Plus size={12} /> Add Attribute
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Images</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {(formData.images || []).map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={10} />
                                                </button>
                                                {img.isPrimary && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[8px] py-0.5 text-center font-medium">
                                                        Primary
                                                    </div>
                                                )}
                                                {!img.isPrimary && (
                                                    <button
                                                        onClick={() => setPrimaryImage(index)}
                                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/90 text-gray-800 text-[8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                    >
                                                        Set Primary
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {(formData.images || []).length < 5 && (
                                            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition gap-1">
                                                <Upload size={16} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500 font-medium">Add</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
