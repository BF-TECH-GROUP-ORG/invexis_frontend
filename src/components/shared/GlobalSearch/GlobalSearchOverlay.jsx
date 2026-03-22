"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CornerDownLeft, Loader2, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import useGlobalSearch from "./useGlobalSearch";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function GlobalSearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { results, isLoading, saveRecentSearch, clearRecentSearches, recentSearches } = useGlobalSearch(query, session);

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
    saveRecentSearch(item);
    onClose();
    router.push(item.link);
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  if (typeof document === "undefined") return null;

  // Group results for better UI
  const hasResults = results.length > 0;
  const isRecentView = query.length === 0 && hasResults;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/60 backdrop-blur-xl transition-opacity"
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col backdrop-blur-3xl"
          >
            {/* Search Header */}
            <div className="relative flex items-center p-8 pb-6">
              <div className="relative flex items-center flex-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl px-5 py-4 border border-transparent focus-within:border-orange-500/50 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all duration-300">
                <Search className={`w-6 h-6 mr-4 transition-colors ${isLoading ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, staff, pages..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xl text-gray-900 dark:text-white placeholder-gray-400/70 focus:ring-0 outline-none font-medium"
                />
                {query && !isLoading && (
                  <button onClick={clearQuery} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                )}
              </div>
              <button 
                onClick={onClose}
                className="ml-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all hover:rotate-90 duration-300"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Results Area */}
            <div 
              ref={scrollRef}
              className="max-h-[55vh] overflow-y-auto custom-scrollbar px-8 pb-8"
            >
              {!hasResults && query.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 text-center"
                >
                  <div className="inline-flex p-6 rounded-[2rem] bg-gray-100 dark:bg-gray-800 mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Quick Search</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 px-12 leading-relaxed">
                    Search for products, staff members, shops, or jump to any page in the application.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {['Products', 'Reports', 'Staff', 'Sales'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQuery(tag)} 
                        className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {hasResults && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {isRecentView && (
                    <div className="flex items-center justify-between px-2 mb-[-1rem]">
                      <div className="flex items-center gap-2 opacity-50">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Recent Searches</span>
                      </div>
                      <button 
                        onClick={clearRecentSearches}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {results.map((item, index) => (
                      <motion.button
                        key={`${item.type}-${item.id}`}
                        id={`search-result-${index}`}
                        variants={itemVariants}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`w-full flex items-center gap-5 p-4 rounded-[1.5rem] transition-all duration-300 group text-left ${
                          activeIndex === index 
                            ? "bg-white dark:bg-gray-800 shadow-sm ring-1 ring-orange-500/20" 
                            : "hover:bg-white/40 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${
                          activeIndex === index ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 opacity-70"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-base font-bold transition-colors ${activeIndex === index ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                              {item.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              activeIndex === index 
                                ? "bg-orange-100 text-orange-600 border-orange-200" 
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate font-medium">
                            {item.subtitle}
                          </p>
                        </div>
                        {activeIndex === index && (
                          <motion.div 
                            layoutId="indicator"
                            className="flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-200/50"
                          >
                            <span>SELECT</span>
                            <CornerDownLeft size={10} />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {!hasResults && query.length > 0 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center"
                >
                  <div className="inline-flex p-6 rounded-[2rem] bg-gray-100 dark:bg-gray-800 mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-400">No results for "{query}"</h3>
                  <p className="text-sm text-gray-400 mt-2 px-12 font-medium">
                    We couldn't find anything matching your search. Try using more general keywords like <span className="text-orange-500">"stock"</span>, <span className="text-orange-500">"money"</span>, or <span className="text-orange-500">"team"</span>.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-1 rounded-lg bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 shadow-sm min-w-[24px]">↑</kbd>
                    <kbd className="px-1.5 py-1 rounded-lg bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 shadow-sm min-w-[24px]">↓</kbd>
                  </div>
                  <span className="opacity-60">to navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 shadow-sm">ENTER</kbd>
                  <span className="opacity-60">to select</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Search size={14} className="text-orange-500" />
                <span className="bg-linear-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Global Search</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
