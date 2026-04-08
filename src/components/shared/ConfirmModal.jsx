"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmModal - A premium confirmation dialog for critical actions
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false
}) {
  const themes = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      confirmBtn: "bg-red-600 hover:bg-red-700 shadow-red-100",
      titleColor: "text-red-900"
    },
    warning: {
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      confirmBtn: "bg-orange-600 hover:bg-orange-700 shadow-orange-100",
      titleColor: "text-orange-900"
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
      titleColor: "text-blue-900"
    }
  };

  const theme = themes[type] || themes.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-gray-100"
            >
              <div className="relative p-6 sm:p-8">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${theme.iconBg} ${theme.iconColor} rounded-2xl flex items-center justify-center mb-6`}>
                    <AlertTriangle size={32} />
                  </div>

                  {/* Text Content */}
                  <h3 className={`text-xl font-extrabold ${theme.titleColor} mb-2 tracking-tight`}>
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    {message}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm disabled:opacity-50"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={onConfirm}
                      disabled={isLoading}
                      className={`flex-1 px-6 py-3.5 ${theme.confirmBtn} text-white font-bold rounded-xl transition-all text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        confirmText
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
