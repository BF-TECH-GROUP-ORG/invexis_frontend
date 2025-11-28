"use client";

import { Calendar } from "lucide-react";

export default function DateRangeFilter({ dateRange, onChange }) {
  const handleQuickSelect = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    onChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500" />
          <span className="font-medium text-gray-700">Date Range:</span>
        </div>
        
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => onChange({ ...dateRange, startDate: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        
        <span className="text-gray-500">to</span>
        
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => onChange({ ...dateRange, endDate: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
        />

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleQuickSelect(90)}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Last 90 Days
          </button>
        </div>
      </div>
    </div>
  );
}