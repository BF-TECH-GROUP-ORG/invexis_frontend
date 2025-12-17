"use client";

import {
    Folder,
    ShoppingCart,
    Package,
    Wallet,
    Users,
    BarChart3,
    Trash2,
    Archive,
    ChevronLeft,
    Menu
} from "lucide-react";
import { useState, useEffect } from "react";

export default function FolderNavigation({ onSelect, activeCategory }) {
    const [isOpen, setIsOpen] = useState(true);

    // Auto-collapse after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsOpen(false);
        }, 5000); // Increased slightly for better UX
        return () => clearTimeout(timer);
    }, []);

    const mainCategories = [
        { id: "All Files", label: "All Files", icon: <Folder size={24} /> },
        { id: "Sales & Orders", label: "Sales & Orders", icon: <ShoppingCart size={24} /> },
        { id: "Inventory", label: "Inventory", icon: <Package size={24} /> },
        { id: "Financial", label: "Financial", icon: <Wallet size={24} /> },
        { id: "Human Resources", label: "Human Resources", icon: <Users size={24} /> },
        { id: "Reports", label: "Reports", icon: <BarChart3 size={24} /> },
    ];

    const systemItems = [
        { id: "Trash", label: "Trash", icon: <Trash2 size={24} /> },
        { id: "Archived", label: "Archived", icon: <Archive size={24} /> },
    ];

    return (
        <div
            className={`flex-shrink-0 flex flex-col bg-white border-r border-gray-100 h-full transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}
        >
            {/* Header / Toggle */}
            <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
                {isOpen && (
                    <span className="font-bold text-gray-800 tracking-wide text-sm uppercase">
                        Documents
                    </span>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                    title={isOpen ? "Collapse" : "Expand"}
                >
                    {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-2 space-y-8">

                {/* My Drive */}
                <div className="px-3">
                    {isOpen && (
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            My Drive
                        </h3>
                    )}
                    <nav className="space-y-1">
                        {mainCategories.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                title={!isOpen ? item.label : ""}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${activeCategory === item.id
                                        ? "bg-orange-50 text-orange-600 shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    } ${!isOpen && 'justify-center'}`}
                            >
                                <span className={`transition-transform duration-200 ${!isOpen && 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>

                                {isOpen && (
                                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* System */}
                <div className="px-3">
                    {isOpen && (
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            System
                        </h3>
                    )}
                    <nav className="space-y-1">
                        {systemItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                title={!isOpen ? item.label : ""}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${activeCategory === item.id
                                        ? "bg-orange-50 text-orange-600 shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    } ${!isOpen && 'justify-center'}`}
                            >
                                <span className={`transition-transform duration-200 ${!isOpen && 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>

                                {isOpen && (
                                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
