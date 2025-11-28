"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function InventoryChart({ data }) {
  // Mock data if no data provided
  const chartData = data || [
    { date: "Jan", value: 4000, stockIn: 2400, stockOut: 1600 },
    { date: "Feb", value: 3000, stockIn: 1398, stockOut: 1602 },
    { date: "Mar", value: 2000, stockIn: 3800, stockOut: 1800 },
    { date: "Apr", value: 2780, stockIn: 3908, stockOut: 1128 },
    { date: "May", value: 1890, stockIn: 4800, stockOut: 2910 },
    { date: "Jun", value: 2390, stockIn: 3800, stockOut: 1410 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
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
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ fill: "#f97316", r: 4 }}
          activeDot={{ r: 6 }}
          name="Total Value"
        />
        <Line
          type="monotone"
          dataKey="stockIn"
          stroke="#fb923c"
          strokeWidth={2}
          dot={{ fill: "#fb923c", r: 3 }}
          name="Stock In"
        />
        <Line
          type="monotone"
          dataKey="stockOut"
          stroke="#fdba74"
          strokeWidth={2}
          dot={{ fill: "#fdba74", r: 3 }}
          name="Stock Out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}