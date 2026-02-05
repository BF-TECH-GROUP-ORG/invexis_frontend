"use client";

import React from "react";

export default function PeriodToggle({ value = "6M", onChange }) {
  const options = ["1M", "3M", "6M", "1Y"];

  return (
    <div className="flex items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange && onChange(opt)}
          className={`px-3 py-1 rounded-full text-sm border border-neutral-200 transition-colors ${
            value === opt
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
