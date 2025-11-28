"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function ABCAnalysisChart({ data }) {
  const chartData = data || [
    { name: "Class A", value: 70, count: 45 },
    { name: "Class B", value: 20, count: 120 },
    { name: "Class C", value: 10, count: 235 },
  ];

  const COLORS = {
    "Class A": "#10b981",
    "Class B": "#f59e0b",
    "Class C": "#ef4444",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Value: {payload[0].value}%</p>
          <p className="text-sm text-gray-600">Items: {payload[0].payload.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span className="text-sm">
              {value} <span className="text-gray-500">({entry.payload.count} items)</span>
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}