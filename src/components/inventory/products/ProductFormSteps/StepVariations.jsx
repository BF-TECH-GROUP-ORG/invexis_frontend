// src/components/inventory/products/ProductFormSteps/StepVariations.jsx
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, Trash2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function StepVariations({
    formData,
    updateFormData,
    errors,
}) {
    const t = useTranslations("products.form");
    const [variants, setVariants] = useState(formData.variants || []);
    const [variations, setVariations] = useState(formData.variations || []);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        // Sync local state with formData if it changes externally
        if (formData.variants) setVariants(formData.variants);
        if (formData.variations) setVariations(formData.variations);
    }, [formData.variants, formData.variations]);

    const handleAddVariant = () => {
        const newVariants = [...variants, { name: "", options: [] }];
        setVariants(newVariants);
        updateFormData({ variants: newVariants });
    };

    const handleRemoveVariant = (index) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
        updateFormData({ variants: newVariants });
    };

    const handleVariantNameChange = (index, name) => {
        const newVariants = [...variants];
        newVariants[index].name = name;
        setVariants(newVariants);
        updateFormData({ variants: newVariants });
    };

    const handleAddOption = (variantIndex, option) => {
        if (!option.trim()) return;
        const newVariants = [...variants];
        if (!newVariants[variantIndex].options.includes(option.trim())) {
            newVariants[variantIndex].options.push(option.trim());
            setVariants(newVariants);
            updateFormData({ variants: newVariants });
        }
    };

    const handleRemoveOption = (variantIndex, optionIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
        setVariants(newVariants);
        updateFormData({ variants: newVariants });
    };

    const generateVariations = () => {
        if (variants.length === 0) return;

        // Cartesian product of options
        const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        const optionsArrays = variants.map(v => v.options.map(opt => ({ name: v.name, value: opt })));

        if (optionsArrays.some(arr => arr.length === 0)) {
            alert("Please add at least one option for each variant type.");
            return;
        }

        let combinations = [];
        if (optionsArrays.length === 1) {
            combinations = optionsArrays[0].map(item => [item]);
        } else {
            combinations = cartesian(...optionsArrays);
        }

        const newVariations = combinations.map(combo => {
            // Convert array of {name, value} to object {name: value}
            // e.g. { "color": "Red", "storage": "256GB" }
            const options = combo.reduce((acc, curr) => {
                // Use lowercase keys for consistency if desired, or keep as is.
                // The payload example used lowercase "color", "storage".
                // We'll lowercase the key to match common conventions.
                acc[curr.name.toLowerCase()] = curr.value;
                return acc;
            }, {});

            return {
                options: options,
                weight: { value: 0, unit: 'g' },
                dimensions: { length: 0, width: 0, height: 0, unit: 'mm' },
                initialStock: 0,
                lowStockThreshold: 10,
                minReorderQty: 5,
                isActive: true
            };
        });

        setVariations(newVariations);
        updateFormData({ variations: newVariations });
    };

    const updateVariation = (index, field, value) => {
        const newVariations = [...variations];
        newVariations[index][field] = value;
        setVariations(newVariations);
        updateFormData({ variations: newVariations });
    };

    const updateVariationNested = (index, parent, field, value) => {
        const newVariations = [...variations];
        if (!newVariations[index][parent]) {
            newVariations[index][parent] = {};
        }
        newVariations[index][parent][field] = value;
        setVariations(newVariations);
        updateFormData({ variations: newVariations });
    };

    const toggleRow = (index) => {
        if (expandedRow === index) {
            setExpandedRow(null);
        } else {
            setExpandedRow(index);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
        >
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">{t("fields.variants")}</h3>
                <p className="text-sm text-gray-500 mb-6">
                    {t("fields.variantsDesc")}
                </p>

                {variants.map((variant, vIndex) => (
                    <div key={vIndex} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t("fields.attrNameLabel")}</label>
                                <input
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) => handleVariantNameChange(vIndex, e.target.value)}
                                    placeholder={t("fields.attrNamePlaceholder")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveVariant(vIndex)}
                                className="text-red-500 hover:text-red-700 p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t("fields.optionsLabel")}</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {variant.options.map((option, oIndex) => (
                                    <span key={oIndex} className="bg-white border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {option}
                                        <button onClick={() => handleRemoveOption(vIndex, oIndex)} className="text-gray-400 hover:text-red-500">
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder={t("fields.optionsPlaceholder")}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddOption(vIndex, e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddVariant}
                    className="flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700"
                >
                    <Plus size={18} />
                    {t("fields.addAttribute")}
                </button>
            </div>

            {variants.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={generateVariations}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-md"
                    >
                        <RefreshCw size={18} />
                        {t("fields.generateVariations")}
                    </button>
                </div>
            )}

            {variations.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">{t("fields.variationsCount", { count: variations.length })}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="py-3 px-4 rounded-tl-lg">Options</th>
                                    <th className="py-3 px-4">Stock</th>
                                    <th className="py-3 px-4">Weight</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 rounded-tr-lg w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {variations.map((variation, index) => (
                                    <>
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium">
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(variation.options || {}).map(([key, val]) => (
                                                        <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {key}: {val}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="number"
                                                    value={variation.initialStock}
                                                    onChange={(e) => updateVariation(index, 'initialStock', Number(e.target.value))}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={variation.weight?.value || 0}
                                                        onChange={(e) => updateVariationNested(index, 'weight', 'value', Number(e.target.value))}
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                                    />
                                                    <span className="text-gray-500 text-xs">{variation.weight?.unit || 'g'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => updateVariation(index, 'isActive', !variation.isActive)}
                                                    className={`px-2 py-1 rounded text-xs font-medium ${variation.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {variation.isActive ? t("fields.active") : t("fields.inactive")}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => toggleRow(index)}
                                                    className="text-gray-400 hover:text-orange-500 transition-colors"
                                                >
                                                    {expandedRow === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === index && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="5" className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Inventory Details */}
                                                        <div className="bg-white p-3 rounded border border-gray-200">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t("fields.inventorySettings")}</h4>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.lowStockAlert")}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={variation.lowStockThreshold}
                                                                        onChange={(e) => updateVariation(index, 'lowStockThreshold', Number(e.target.value))}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.minReorderQty")}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={variation.minReorderQty}
                                                                        onChange={(e) => updateVariation(index, 'minReorderQty', Number(e.target.value))}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Dimensions */}
                                                        <div className="bg-white p-3 rounded border border-gray-200">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t("fields.dimensions", { unit: variation.dimensions?.unit || "mm" })}</h4>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.length")}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={variation.dimensions?.length || 0}
                                                                        onChange={(e) => updateVariationNested(index, 'dimensions', 'length', Number(e.target.value))}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.width")}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={variation.dimensions?.width || 0}
                                                                        onChange={(e) => updateVariationNested(index, 'dimensions', 'width', Number(e.target.value))}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.height")}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={variation.dimensions?.height || 0}
                                                                        onChange={(e) => updateVariationNested(index, 'dimensions', 'height', Number(e.target.value))}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Weight & Units */}
                                                        <div className="bg-white p-3 rounded border border-gray-200">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t("fields.units")}</h4>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.weightUnit")}</label>
                                                                    <select
                                                                        value={variation.weight?.unit || 'g'}
                                                                        onChange={(e) => updateVariationNested(index, 'weight', 'unit', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                                                    >
                                                                        <option value="g">g</option>
                                                                        <option value="kg">kg</option>
                                                                        <option value="lb">lb</option>
                                                                        <option value="oz">oz</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">{t("fields.dimUnit")}</label>
                                                                    <select
                                                                        value={variation.dimensions?.unit || 'mm'}
                                                                        onChange={(e) => updateVariationNested(index, 'dimensions', 'unit', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                                                    >
                                                                        <option value="mm">mm</option>
                                                                        <option value="cm">cm</option>
                                                                        <option value="in">in</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
