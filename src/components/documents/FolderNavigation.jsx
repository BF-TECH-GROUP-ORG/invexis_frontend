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
    Menu,
    Plus
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FolderNavigation - Premium Glassmorphic Navigation
 */
export default function FolderNavigation({ onSelect, activeCategory }) {
    const [isOpen, setIsOpen] = useState(true);

    const mainCategories = [
        { id: "All Files", label: "All Files", icon: <Folder size={20} /> },
        { id: "Sales & Orders", label: "Sales & Orders", icon: <ShoppingCart size={20} /> },
        { id: "Inventory", label: "Inventory", icon: <Package size={20} /> },
        { id: "Financial", label: "Financial", icon: <Wallet size={20} /> },
        { id: "Human Resources", label: "Human Resources", icon: <Users size={20} /> },
        { id: "Reports", label: "Reports", icon: <BarChart3 size={20} /> },
    ];

    const systemItems = [
        { id: "Trash", label: "Trash", icon: <Trash2 size={20} /> },
        { id: "Archived", label: "Archived", icon: <Archive size={20} /> },
    ];

    return (
        <motion.div
            layout
            className={`shrink-0 flex flex-col bg-white/40 backdrop-blur-xl border-r border-slate-100 h-full transition-all duration-500 ease-[0.22, 1, 0.36, 1] relative ${isOpen ? 'w-72' : 'w-24'}`}
        >
            {/* Control Toggle */}
            <div className={`p-6 mb-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-[#081422] rounded-lg flex items-center justify-center text-white shadow-lg">
                                <Plus size={18} />
                            </div>
                            <span className="font-black text-[#081422] tracking-tight text-base uppercase">
                                Workspace
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 shadow-sm transition-all duration-300"
                >
                    {isOpen ? <ChevronLeft size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
                </motion.button>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-10 scrollbar-hide">

                {/* Main Section */}
                <div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-4"
                            >
                                Explorer
                            </motion.h3>
                        )}
                    </AnimatePresence>
                    <nav className="space-y-1.5">
                        {mainCategories.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${activeCategory === item.id
                                    ? "bg-[#081422] text-white shadow-xl shadow-[#081422]/10"
                                    : "text-slate-500 hover:bg-orange-50/50 hover:text-orange-600"
                                } ${!isOpen && 'justify-center'}`}
                            >
                                <motion.span 
                                    layout
                                    className={`shrink-0 transition-transform duration-300 ${!isOpen && 'group-hover:scale-125'}`}
                                >
                                    {item.icon}
                                </motion.span>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-bold text-sm tracking-tight whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {activeCategory === item.id && isOpen && (
                                    <motion.div 
                                        layoutId="active-indicator"
                                        className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full" 
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* System Section */}
                <div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-4"
                            >
                                Operations
                            </motion.h3>
                        )}
                    </AnimatePresence>
                    <nav className="space-y-1.5">
                        {systemItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${activeCategory === item.id
                                    ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-[#081422]"
                                } ${!isOpen && 'justify-center'}`}
                            >
                                <span className={`shrink-0 transition-transform duration-300 ${!isOpen && 'group-hover:scale-125'}`}>
                                    {item.icon}
                                </span>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-bold text-sm tracking-tight whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="p-6 border-t border-slate-50">
                <div className={`flex items-center gap-4 ${!isOpen && 'justify-center'}`}>
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg">
                        <Archive size={20} />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-[#081422] uppercase tracking-tighter">Vault Storage</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Premium Plan</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

