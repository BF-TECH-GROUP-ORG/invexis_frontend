"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command, CornerDownLeft, Sparkles, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import useGlobalSearch from "./useGlobalSearch";

export default function GlobalSearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { results, isLoading } = useGlobalSearch(query, session);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, activeIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = document.getElementById(`search-result-${activeIndex}`);
    if (activeEl && scrollRef.current) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleSelect = (item) => {
    onClose();
    router.push(item.link);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col"
          >
            {/* Search Header */}
            <div className="relative flex items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <Search className={`w-6 h-6 mr-4 transition-colors ${isLoading ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products, staff, pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 outline-none"
              />
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-4" />
              ) : (
                <div className="flex items-center gap-2 mr-4">
                  <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 border border-gray-200 dark:border-gray-700 shadow-sm">ESC</kbd>
                </div>
              )}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Results Area */}
            <div 
              ref={scrollRef}
              className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3"
            >
              {query.length < 2 ? (
                <div className="py-12 text-center">
                  <div className="inline-flex p-4 rounded-3xl bg-orange-50 dark:bg-orange-500/10 mb-4">
                    <Sparkles className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Start typing to search...</h3>
                  <p className="text-sm text-gray-500 mt-1 px-12">Search for products, staff members, shops, or jump to any page in the application.</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-6 pb-4">
                  {/* Category Groups could be added here, but for now we'll just list them with highlights */}
                  <div className="space-y-1">
                    {results.map((item, index) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        id={`search-result-${index}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group text-left ${
                          activeIndex === index 
                            ? "bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-200 dark:ring-orange-500/30" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className={`p-3 rounded-xl transition-colors ${
                          activeIndex === index ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-gray-100 dark:bg-gray-800"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200 dark:border-gray-700">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        {activeIndex === index && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-2 py-1 rounded-lg"
                          >
                            <span>SELECT</span>
                            <CornerDownLeft size={10} />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : !isLoading && (
                <div className="py-12 text-center">
                  <div className="inline-flex p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/10 mb-4 border border-gray-100 dark:border-gray-800">
                    <Command className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-500">No results found for "{query}"</h3>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms or jumping to a common page.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs text-center min-w-[20px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs text-center min-w-[20px]">↓</kbd>
                  <span>to navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs min-w-[20px]">ENTER</kbd>
                  <span>to select</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-60">
                <Sparkles size={12} className="text-orange-500" />
                <span>Powered by Invexix Global Search</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
