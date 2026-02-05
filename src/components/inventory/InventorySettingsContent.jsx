"use client";

import React, { useState } from "react";
import {
    Settings,
    LayoutDashboard,
    Bell,
    Palette,
    Shield,
    Database
} from "lucide-react";
import { DashboardConfigPanel } from "@/components/inventory/dashboardConfig";

const settingsTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Export", icon: Database },
];

export default function InventorySettingsContent() {
    const [activeTab, setActiveTab] = useState("dashboard");

    // In a real app, get this from your auth context/store
    const companyId = typeof window !== 'undefined'
        ? localStorage.getItem('companyId') || 'demo-company'
        : 'demo-company';

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <Settings size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventory Settings</h1>
                        <p className="text-gray-500">Customize your inventory experience</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Settings</h3>
                        </div>
                        <nav className="p-2">
                            {settingsTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                                            ? "bg-orange-50 text-orange-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {activeTab === "dashboard" && (
                        <DashboardConfigPanel companyId={companyId} />
                    )}

                    {activeTab === "notifications" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Bell size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                                    <p className="text-sm text-gray-500">Manage alerts and notifications</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Low Stock Alerts", desc: "Get notified when stock is low" },
                                    { label: "Daily Reports", desc: "Receive daily summary emails" },
                                    { label: "Order Updates", desc: "Updates on purchase orders" },
                                    { label: "Price Changes", desc: "Notifications on price updates" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <button className="relative w-12 h-6 bg-orange-500 rounded-full">
                                            <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Palette size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Appearance Settings</h2>
                                    <p className="text-sm text-gray-500">Customize the look and feel</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["Light", "Dark", "System"].map((theme) => (
                                            <button
                                                key={theme}
                                                className={`p-4 border rounded-lg text-center transition-all ${theme === "Light"
                                                    ? "border-orange-400 bg-orange-50 text-orange-700"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                    }`}
                                            >
                                                {theme}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Accent Color</label>
                                    <div className="flex gap-3">
                                        {["bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500"].map((color, i) => (
                                            <button
                                                key={i}
                                                className={`w-10 h-10 rounded-lg ${color} ${i === 0 ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Shield size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                                    <p className="text-sm text-gray-500">Manage security and access</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-center py-8">Security settings coming soon...</p>
                        </div>
                    )}

                    {activeTab === "data" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Database size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Data & Export</h2>
                                    <p className="text-sm text-gray-500">Manage your data and exports</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-orange-400 transition-colors">
                                    <p className="font-medium text-gray-900">Export All Data</p>
                                    <p className="text-sm text-gray-500">Download all your inventory data as CSV</p>
                                </button>
                                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-orange-400 transition-colors">
                                    <p className="font-medium text-gray-900">Import Data</p>
                                    <p className="text-sm text-gray-500">Upload data from CSV or Excel</p>
                                </button>
                                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-orange-400 transition-colors">
                                    <p className="font-medium text-gray-900">Backup Settings</p>
                                    <p className="text-sm text-gray-500">Configure automatic backups</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
