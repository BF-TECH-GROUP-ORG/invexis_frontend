"use client";

import { AlertTriangle, Clock } from "lucide-react";

export default function AgingInventoryTable({ data }) {
  const tableData = data || [
    { product: "iPhone 13", days: 120, quantity: 45, value: "$44,955", risk: "high" },
    { product: "Samsung S21", days: 90, quantity: 30, value: "$23,970", risk: "medium" },
    { product: "MacBook Pro", days: 60, quantity: 15, value: "$29,985", risk: "medium" },
    { product: "iPad Air", days: 45, quantity: 25, value: "$14,975", risk: "low" },
    { product: "AirPods Pro", days: 30, quantity: 80, value: "$19,920", risk: "low" },
  ];

  const getRiskBadge = (risk) => {
    const styles = {
      high: "bg-red-100 text-red-700",
      medium: "bg-orange-100 text-orange-700",
      low: "bg-yellow-100 text-yellow-700",
    };
    return styles[risk] || styles.low;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="py-3 px-4 font-semibold">Product</th>
              <th className="py-3 px-4 font-semibold">Days in Stock</th>
              <th className="py-3 px-4 font-semibold">Quantity</th>
              <th className="py-3 px-4 font-semibold">Value</th>
              <th className="py-3 px-4 font-semibold">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4 font-medium text-gray-900">{item.product}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>{item.days} days</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">{item.value}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskBadge(item.risk)}`}>
                    {item.risk === "high" && <AlertTriangle size={12} className="inline mr-1" />}
                    {item.risk.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}