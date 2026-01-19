import React, { useRef } from "react";
import { Download, Calendar, RefreshCw, Loader } from "lucide-react";
import html2pdf from "html2pdf.js";

const InventoryHeader = ({ onRefresh, lastUpdated }) => {
  const contentRef = useRef(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const formatLast = (d) => {
    if (!d) return "Unknown";
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString();
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // Get the entire content container
      const element = document.getElementById("inventory-overview-content");
      if (!element) {
        alert("Could not find content to export");
        setIsExporting(false);
        return;
      }

      // Create a clone to avoid modifying the original
      const clonedElement = element.cloneNode(true);

      // Configure html2pdf options
      const options = {
        margin: 10,
        filename: `Inventory-Overview-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      // Generate PDF
      await html2pdf().set(options).from(clonedElement).save();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Inventory Overview
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time situational awareness of your stock health
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-center">
          <button
            onClick={onRefresh}
            className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <div className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="hidden md:inline">Last 30 Days</span>
            <span className="md:hidden text-[10px]">30D</span>
          </div>

          <div className="text-xs md:text-sm text-gray-400 text-center md:text-left">
            <span className="hidden md:inline">Last updated: </span>
            <span className="font-medium text-gray-700 dark:text-gray-300 block md:inline">
              {formatLast(lastUpdated)}
            </span>
          </div>
        </div>

        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-2 text-xs md:text-sm font-medium text-white bg-orange-500 rounded-lg md:rounded-xl hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg shrink-0 w-full md:w-auto"
        >
          {isExporting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export Report</span>
              <span className="md:hidden">Export</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InventoryHeader;
