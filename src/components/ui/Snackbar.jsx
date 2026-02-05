"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const severityStyles = {
  success: {
    bg: "bg-green-500",
    icon: <CheckCircle className="w-6 h-6 text-white" />,
    title: "Success",
  },
  error: {
    bg: "bg-red-500",
    icon: <XCircle className="w-6 h-6 text-white" />,
    title: "Error",
  },
  warning: {
    bg: "bg-amber-500",
    icon: <AlertTriangle className="w-6 h-6 text-white" />,
    title: "Warning",
  },
  info: {
    bg: "bg-blue-500",
    icon: <Info className="w-6 h-6 text-white" />,
    title: "Information",
  },
};

export default function Snackbar({
  open,
  message,
  severity = "info",
  onClose,
  autoHideDuration = 5000,
}) {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  const style = severityStyles[severity] || severityStyles.info;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-6 right-6 z-[9999] flex max-w-sm w-full shadow-2xl rounded-xl overflow-hidden"
        >
          {/* Colored Sidebar/Icon Area */}
          <div className={`${style.bg} p-4 flex items-center justify-center`}>
            {style.icon}
          </div>

          {/* Content Area */}
          <div className="bg-white p-4 flex-1 flex flex-col justify-center border-y border-r border-gray-100 rounded-r-xl relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
            <h4
              className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                severity === "error"
                  ? "text-red-600"
                  : severity === "warning"
                  ? "text-amber-600"
                  : severity === "success"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {style.title}
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed pr-6">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
