"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLoader({ visible = false, text = "Loading..." }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Circular Loader */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>

            {/* Loading Text */}
            {text && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                {text}
              </motion.p>
            )}

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-8"
            >
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                INVEX<span className="text-orange-500 font-extrabold">iS</span>
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
