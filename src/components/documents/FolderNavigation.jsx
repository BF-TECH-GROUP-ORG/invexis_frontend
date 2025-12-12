"use client";

import {
    Folder,
    ShoppingCart,
    Package,
    Wallet,
    Users,
    BarChart3,
    Trash2,
    Archive
} from "lucide-react";

export default function FolderNavigation({ onSelect, activeCategory }) {
    const mainCategories = [
        { id: "All Files", label: "All Files", icon: <Folder size={32} /> },
        { id: "Sales & Orders", label: "Sales & Orders", icon: <ShoppingCart size={32} /> },
        { id: "Inventory", label: "Inventory", icon: <Package size={32} /> },
        { id: "Financial", label: "Financial", icon: <Wallet size={32} /> },
        { id: "Human Resources", label: "Human Resources", icon: <Users size={32} /> },
        { id: "Reports", label: "Reports", icon: <BarChart3 size={32} /> },
    ];

    const systemItems = [
        { id: "Trash", label: "Trash", icon: <Trash2 size={32} /> },
        { id: "Archived", label: "Archived", icon: <Archive size={32} /> },
    ];

    return (
        <div className="w-full bg-white flex-shrink-0 flex flex-col pt-4 h-full">
            <div className="px-4 mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">My Drive</h3>
                <nav className="space-y-0.5">
                    {mainCategories.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${activeCategory === item.id
                                ? "bg-orange-50 text-orange-700"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <span className="text-gray-500">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="px-4 mt-auto mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">System</h3>
                <nav className="space-y-0.5">
                    {systemItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${activeCategory === item.id
                                ? "bg-orange-50 text-orange-700"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <span className="text-gray-500">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
