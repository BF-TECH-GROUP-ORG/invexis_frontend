"use client";

import React from "react";

// Tiny sparkline component using SVG. Expects `data` as array of numbers.
export default function Sparkline({
  data = [],
  stroke = "#ff782d",
  width = 120,
  height = 32,
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const len = data.length || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (len - 1 || 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const last = data.length ? data[data.length - 1] : 0;
  const diff = data.length > 1 ? last - data[0] : 0;
  const positive = diff >= 0;

  return (
    <div className="flex items-center gap-3">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-sm font-medium">
        <div
          className={`text-xs ${positive ? "text-green-600" : "text-red-600"}`}
        >
          {positive ? "↑" : "↓"} {Math.abs(diff)}
        </div>
      </div>
    </div>
  );
}
