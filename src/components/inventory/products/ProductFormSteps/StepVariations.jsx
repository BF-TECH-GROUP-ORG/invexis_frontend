// src/components/inventory/products/ProductFormSteps/StepVariations.jsx
"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function StepVariations({
    formData,
    updateFormData,
    errors,
}) {
    const [variants, setVariants] = useState(formData.variants || []);
    const [variations, setVariations] = useState(formData.variations || []);

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
            // Create a unique SKU suffix or similar
            const skuSuffix = combo.map(c => c.value.substring(0, 3).toUpperCase()).join("-");
            return {
                attributes: combo,
                sku: `${formData.sku || 'SKU'}-${skuSuffix}`,
                price: formData.pricing?.basePrice || 0,
                stockQty: 0,
                images: [],
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

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Add variants like Color or Size to generate combinations.
                </p>

                {variants.map((variant, vIndex) => (
                    <div key={vIndex} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Variant Name</label>
                                <input
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) => handleVariantNameChange(vIndex, e.target.value)}
                                    placeholder="e.g. Color, Size"
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
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Options</label>
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
                                placeholder="Type option and press Enter"
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
                    Add Variant Type
                </button>
            </div>

            {variants.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={generateVariations}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        <RefreshCw size={18} />
                        Generate Variations
                    </button>
                </div>
            )}

            {variations.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Variations ({variations.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-4">Variant</th>
                                    <th className="py-3 px-4">SKU</th>
                                    <th className="py-3 px-4">Price</th>
                                    <th className="py-3 px-4">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variations.map((variation, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">
                                            {variation.attributes.map(a => `${a.name}: ${a.value}`).join(", ")}
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={variation.sku}
                                                onChange={(e) => updateVariation(index, 'sku', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={variation.price}
                                                onChange={(e) => updateVariation(index, 'price', e.target.value)}
                                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={variation.stockQty}
                                                onChange={(e) => updateVariation(index, 'stockQty', e.target.value)}
                                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
