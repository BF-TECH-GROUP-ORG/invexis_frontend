// src/components/inventory/dashboardConfig/WidgetSettingsModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Palette, LayoutGrid } from "lucide-react";

const colorOptions = [
    { name: "Orange", value: "orange", bg: "bg-orange-500" },
    { name: "Blue", value: "blue", bg: "bg-blue-500" },
    { name: "Green", value: "green", bg: "bg-green-500" },
    { name: "Purple", value: "purple", bg: "bg-purple-500" },
    { name: "Red", value: "red", bg: "bg-red-500" },
    { name: "Gray", value: "gray", bg: "bg-gray-500" },
];

const sizeOptions = [
    { name: "Small", value: "small", cols: 1 },
    { name: "Medium", value: "medium", cols: 2 },
    { name: "Large", value: "large", cols: 3 },
    { name: "Full Width", value: "full", cols: 4 },
];

export default function WidgetSettingsModal({
    widget,
    isOpen,
    onClose,
    onSave
}) {
    const [settings, setSettings] = useState({
        color: "orange",
        size: "medium",
        showTitle: true,
        refreshInterval: 30,
    });

    useEffect(() => {
        if (widget?.settings) {
            setSettings({ ...settings, ...widget.settings });
        }
    }, [widget]);

    if (!isOpen || !widget) return null;

    const handleSave = () => {
        onSave(widget.id, settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            {widget.icon && <widget.icon size={20} className="text-orange-600" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Widget Settings</h2>
                            <p className="text-sm text-gray-500">{widget.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Color Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <Palette size={16} />
                            Widget Color
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSettings({ ...settings, color: color.value })}
                                    className={`w-10 h-10 rounded-lg ${color.bg} transition-all ${settings.color === color.value
                                            ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                            : "hover:scale-105"
                                        }`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <LayoutGrid size={16} />
                            Widget Size
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {sizeOptions.map((size) => (
                                <button
                                    key={size.value}
                                    onClick={() => setSettings({ ...settings, size: size.value })}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${settings.size === size.value
                                            ? "border-orange-400 bg-orange-50 text-orange-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                >
                                    {size.name}
                                    <span className="block text-xs text-gray-400 mt-0.5">{size.cols} column(s)</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Show Title Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Show Widget Title</label>
                        <button
                            onClick={() => setSettings({ ...settings, showTitle: !settings.showTitle })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.showTitle ? "bg-orange-500" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.showTitle ? "left-7" : "left-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Refresh Interval */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Auto Refresh (seconds)
                        </label>
                        <select
                            value={settings.refreshInterval}
                            onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        >
                            <option value={0}>Disabled</option>
                            <option value={15}>15 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={60}>1 minute</option>
                            <option value={300}>5 minutes</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
