// src/components/inventory/dashboardConfig/DashboardConfigPanel.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    Save,
    RotateCcw,
    Package,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    ShoppingCart,
    Clock,
    BarChart3,
    Loader2
} from "lucide-react";
import WidgetCard from "./WidgetCard";
import WidgetSettingsModal from "./WidgetSettingsModal";
import { getDashboardConfig, updateDashboardConfig } from "@/services/dashboardConfigService";

const defaultWidgets = [
    {
        id: "quick-actions",
        name: "Quick Actions",
        description: "Shortcuts to common tasks",
        icon: Settings,
        enabled: true,
        order: 0,
        settings: { color: "orange", size: "full" }
    },
    {
        id: "total-products",
        name: "Total Products",
        description: "Count of all products",
        icon: Package,
        enabled: true,
        order: 1,
        settings: { color: "orange", size: "small" }
    },
    {
        id: "total-value",
        name: "Total Value",
        description: "Total inventory value",
        icon: DollarSign,
        enabled: true,
        order: 2,
        settings: { color: "green", size: "small" }
    },
    {
        id: "low-stock-alerts",
        name: "Low Stock Alerts",
        description: "Products running low",
        icon: AlertTriangle,
        enabled: true,
        order: 3,
        settings: { color: "red", size: "small" }
    },
    {
        id: "recent-products",
        name: "Recent Products",
        description: "Latest added products",
        icon: ShoppingCart,
        enabled: true,
        order: 4,
        settings: { color: "orange", size: "medium" }
    },
    {
        id: "recent-activity",
        name: "Recent Activity",
        description: "Latest inventory changes",
        icon: Clock,
        enabled: true,
        order: 5,
        settings: { color: "blue", size: "medium" }
    },
    {
        id: "sales-chart",
        name: "Sales Chart",
        description: "Sales performance graph",
        icon: TrendingUp,
        enabled: false,
        order: 6,
        settings: { color: "purple", size: "large" }
    },
    {
        id: "inventory-chart",
        name: "Inventory Chart",
        description: "Stock levels visualization",
        icon: BarChart3,
        enabled: false,
        order: 7,
        settings: { color: "blue", size: "large" }
    },
];

export default function DashboardConfigPanel({ companyId }) {
    const [widgets, setWidgets] = useState(defaultWidgets);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [companyId]);

    const loadConfig = async () => {
        if (!companyId) {
            setLoading(false);
            return;
        }

        try {
            const result = await getDashboardConfig(companyId);
            if (result?.data?.widgets) {
                // Merge saved config with default widgets
                const savedWidgets = result.data.widgets;
                const mergedWidgets = defaultWidgets.map(dw => {
                    const saved = savedWidgets.find(sw => sw.id === dw.id);
                    return saved ? { ...dw, ...saved } : dw;
                });
                setWidgets(mergedWidgets.sort((a, b) => a.order - b.order));
            }
        } catch (err) {
            // Use defaults if no config exists
            console.log("Using default dashboard config");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (widgetId) => {
        setWidgets(widgets.map(w =>
            w.id === widgetId ? { ...w, enabled: !w.enabled } : w
        ));
    };

    const handleOpenSettings = (widget) => {
        setSelectedWidget(widget);
        setShowSettings(true);
    };

    const handleSaveWidgetSettings = (widgetId, settings) => {
        setWidgets(widgets.map(w =>
            w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w
        ));
    };

    const handleSave = async () => {
        if (!companyId) {
            setMessage({ type: "error", text: "Company ID is required" });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            await updateDashboardConfig(companyId, { widgets });
            setMessage({ type: "success", text: "Dashboard configuration saved!" });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to save configuration"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setWidgets(defaultWidgets);
        setMessage({ type: "success", text: "Reset to default configuration" });
    };

    const enabledWidgets = widgets.filter(w => w.enabled);
    const disabledWidgets = widgets.filter(w => !w.enabled);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Settings size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Dashboard Configuration</h2>
                            <p className="text-sm text-gray-500">Customize your dashboard widgets and layout</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{enabledWidgets.length}</p>
                        <p className="text-sm text-gray-500">Active Widgets</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{disabledWidgets.length}</p>
                        <p className="text-sm text-gray-500">Hidden Widgets</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{widgets.length}</p>
                        <p className="text-sm text-gray-500">Total Widgets</p>
                    </div>
                </div>
            </div>

            {/* Active Widgets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Active Widgets
                </h3>
                <div className="space-y-3">
                    {enabledWidgets.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No active widgets. Enable some below.</p>
                    ) : (
                        enabledWidgets.map((widget) => (
                            <WidgetCard
                                key={widget.id}
                                widget={widget}
                                onToggle={handleToggle}
                                onSettings={handleOpenSettings}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Hidden Widgets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Hidden Widgets
                </h3>
                <div className="space-y-3">
                    {disabledWidgets.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">All widgets are active.</p>
                    ) : (
                        disabledWidgets.map((widget) => (
                            <WidgetCard
                                key={widget.id}
                                widget={widget}
                                onToggle={handleToggle}
                                onSettings={handleOpenSettings}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <WidgetSettingsModal
                widget={selectedWidget}
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={handleSaveWidgetSettings}
            />
        </div>
    );
}
