"use client";

import React from "react";

export default function DateRangeInput({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) {
  return (
    <div className="flex items-center gap-3 text-sm mt-3">
      <label className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">Start</span>
        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => onStartChange && onStartChange(e.target.value)}
          className="px-2 py-1 border border-neutral-200 rounded-md text-sm"
        />
      </label>

      <span className="text-xs text-neutral-400">—</span>

      <label className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">End</span>
        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => onEndChange && onEndChange(e.target.value)}
          className="px-2 py-1 border border-neutral-200 rounded-md text-sm"
        />
      </label>
    </div>
  );
}
