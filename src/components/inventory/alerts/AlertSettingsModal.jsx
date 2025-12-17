// src/components/inventory/alerts/AlertSettingsModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Bell, Package, Calendar, Loader2 } from "lucide-react";
import { getAlertSettings, updateAlertSettings } from "@/services/alertService";

const defaultSettings = {
    lowStock: {
        enabled: true,
        threshold: 10,
        notifyEmail: true,
        notifyDashboard: true,
    },
    expiry: {
        enabled: true,
        daysBeforeExpiry: 30,
        notifyEmail: true,
        notifyDashboard: true,
    },
    outOfStock: {
        enabled: true,
        notifyEmail: true,
        notifyDashboard: true,
    },
    priceChange: {
        enabled: false,
        notifyEmail: false,
        notifyDashboard: true,
    },
};

export default function AlertSettingsModal({ isOpen, onClose, companyId }) {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (isOpen && companyId) {
            loadSettings();
        }
    }, [isOpen, companyId]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const result = await getAlertSettings(companyId);
            if (result?.data) {
                setSettings({ ...defaultSettings, ...result.data });
            }
        } catch (err) {
            // Use defaults
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateAlertSettings(companyId, settings);
            setMessage({ type: "success", text: "Settings saved!" });
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setMessage({ type: "error", text: "Failed to save settings" });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const updateSetting = (category, field, value) => {
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [field]: value,
            },
        });
    };

    const alertTypes = [
        {
            key: "lowStock",
            title: "Low Stock Alerts",
            description: "Get notified when products go below threshold",
            icon: Package,
            color: "orange",
            hasThreshold: true,
            thresholdLabel: "Stock threshold",
        },
        {
            key: "expiry",
            title: "Expiry Alerts",
            description: "Notifications for expiring products",
            icon: Calendar,
            color: "red",
            hasThreshold: true,
            thresholdLabel: "Days before expiry",
            thresholdField: "daysBeforeExpiry",
        },
        {
            key: "outOfStock",
            title: "Out of Stock",
            description: "Alert when products reach zero stock",
            icon: Package,
            color: "gray",
            hasThreshold: false,
        },
        {
            key: "priceChange",
            title: "Price Changes",
            description: "Notifications when prices are updated",
            icon: Bell,
            color: "blue",
            hasThreshold: false,
        },
    ];

    const colorClasses = {
        orange: { bg: "bg-orange-100", icon: "text-orange-600" },
        red: { bg: "bg-red-100", icon: "text-red-600" },
        blue: { bg: "bg-blue-100", icon: "text-blue-600" },
        gray: { bg: "bg-gray-100", icon: "text-gray-600" },
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
                            <Bell size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Alert Settings</h2>
                            <p className="text-sm text-gray-500">Configure alert preferences</p>
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
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                        </div>
                    ) : (
                        alertTypes.map((type) => {
                            const Icon = type.icon;
                            const colors = colorClasses[type.color];
                            const setting = settings[type.key];

                            return (
                                <div key={type.key} className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                                <Icon size={20} className={colors.icon} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{type.title}</h4>
                                                <p className="text-xs text-gray-500">{type.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateSetting(type.key, "enabled", !setting.enabled)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${setting.enabled ? "bg-orange-500" : "bg-gray-300"
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${setting.enabled ? "left-7" : "left-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {setting.enabled && (
                                        <div className="pl-13 space-y-3 mt-3 pt-3 border-t border-gray-100">
                                            {type.hasThreshold && (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600 min-w-[120px]">
                                                        {type.thresholdLabel}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={setting[type.thresholdField || "threshold"]}
                                                        onChange={(e) => updateSetting(
                                                            type.key,
                                                            type.thresholdField || "threshold",
                                                            Number(e.target.value)
                                                        )}
                                                        className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Email notifications</span>
                                                <button
                                                    onClick={() => updateSetting(type.key, "notifyEmail", !setting.notifyEmail)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors ${setting.notifyEmail ? "bg-green-500" : "bg-gray-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${setting.notifyEmail ? "left-5" : "left-0.5"
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Dashboard notifications</span>
                                                <button
                                                    onClick={() => updateSetting(type.key, "notifyDashboard", !setting.notifyDashboard)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors ${setting.notifyDashboard ? "bg-green-500" : "bg-gray-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${setting.notifyDashboard ? "left-5" : "left-0.5"
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
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
                        disabled={saving || loading}
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
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
