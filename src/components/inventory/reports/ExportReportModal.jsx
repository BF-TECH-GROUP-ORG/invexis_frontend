"use client";

import { useState } from "react";
import { X, FileText, FileSpreadsheet, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportReportModal({ onClose, onExport }) {
  const [format, setFormat] = useState("pdf");
  const [reportType, setReportType] = useState("comprehensive");

  const formats = [
    { id: "pdf", name: "PDF Document", icon: <FileText className="text-red-500" size={24} /> },
    { id: "excel", name: "Excel Spreadsheet", icon: <FileSpreadsheet className="text-green-500" size={24} /> },
    { id: "csv", name: "CSV File", icon: <FileSpreadsheet className="text-blue-500" size={24} /> },
  ];

  const reportTypes = [
    { id: "comprehensive", name: "Comprehensive Report", desc: "All metrics and charts" },
    { id: "summary", name: "Executive Summary", desc: "High-level overview only" },
    { id: "inventory", name: "Inventory Details", desc: "Detailed product listing" },
    { id: "financial", name: "Financial Report", desc: "Value and cost analysis" },
  ];

  const handleExport = () => {
    onExport({ format, reportType });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold">Export Report</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {formats.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                      format === fmt.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {fmt.icon}
                    <span className="text-sm font-medium">{fmt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Report Type</label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      reportType === type.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        reportType === type.id ? "border-orange-500" : "border-gray-300"
                      }`}>
                        {reportType === type.id && (
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{type.name}</p>
                        <p className="text-sm text-gray-500">{type.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Export Report
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}