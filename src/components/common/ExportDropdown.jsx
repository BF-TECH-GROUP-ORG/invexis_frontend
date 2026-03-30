"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText, FileSpreadsheet, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportDropdown({ onExport, label = "Export", disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    {
      id: "pdf",
      label: "Export PDF",
      icon: <FileText size={18} className="text-red-500" />,
      description: "Best for sharing and printing"
    },
    {
      id: "excel",
      label: "Export Excel",
      icon: <FileSpreadsheet size={18} className="text-green-600" />,
      description: "Best for data analysis"
    }
  ];

  const handleSelect = (format) => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-all text-gray-700 font-medium ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${isOpen ? "ring-2 ring-orange-500/20 border-orange-500 bg-orange-50 text-orange-600" : ""}`}
      >
        <Download size={18} />
        <span>{label}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 py-2"
          >
            <div className="px-4 py-2 mb-1 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Choose Format</p>
            </div>
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                  {option.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
