"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function StockMovementChart({ data, dateRange }) {
  const chartData = data || [
    { date: "Week 1", stockIn: 4000, stockOut: 2400 },
    { date: "Week 2", stockIn: 3000, stockOut: 1398 },
    { date: "Week 3", stockIn: 2000, stockOut: 3800 },
    { date: "Week 4", stockIn: 2780, stockOut: 3908 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} barSize={25}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        />
        <Legend />
        <Bar
          dataKey="stockIn"
          fill="#f97316"
          radius={[8, 8, 0, 0]}
          name="Stock In"
        />
        <Bar
          dataKey="stockOut"
          fill="#fb923c"
          radius={[8, 8, 0, 0]}
          name="Stock Out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}