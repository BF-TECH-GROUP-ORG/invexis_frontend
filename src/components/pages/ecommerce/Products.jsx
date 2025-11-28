"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import { Package, AlertTriangle, RefreshCw } from "lucide-react";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stockLevels = [
  { name: "Product A", stock: 120 },
  { name: "Product B", stock: 45 },
  { name: "Product C", stock: 200 },
  { name: "Product D", stock: 10 },
];

const COLORS = ["#4f46e5", "#06b6d4", "#f97316", "#ef4444"];

export default function Products() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product List</h1>
        <div className="text-sm text-gray-500">
          Manage product catalog and quick stats.
        </div>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "total",
            title: "Active Products",
            value: 1203,
            icon: Package,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "Active products",
          },
          {
            key: "low_stock",
            title: "Low stock",
            value: 18,
            icon: AlertTriangle,
            color: "#ff7a45",
            bgColor: "#fff8f5",
            description: "Products low on stock",
          },
          {
            key: "pending",
            title: "Pending updates",
            value: 7,
            icon: RefreshCw,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            description: "Products pending update",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl border border-neutral-300 h-72">
          <h4 className="font-semibold mb-2">Stock by Product</h4>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={stockLevels}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="stock" fill="#ff7a45" radius={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-white rounded-xl border border-neutral-300 h-72">
          <h4 className="font-semibold mb-2">Stock composition</h4>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={stockLevels}
                dataKey="stock"
                nameKey="name"
                outerRadius={90}
                innerRadius={50}
                label
                stroke="white"
                strokeWidth={3}
                cornerRadius={10}
              >
                {stockLevels.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <section>
        <EcommerceDataTable
          columns={[
            { id: "sku", label: "SKU", accessor: "sku" },
            { id: "name", label: "Name", accessor: "name" },
            { id: "category", label: "Category", accessor: "category" },
            { id: "price", label: "Price", accessor: "price" },
            {
              id: "stock",
              label: "Stock",
              accessor: "stock",
              render: (r) => (
                <span className={r.stock < 10 ? "text-red-600" : ""}>
                  {r.stock}
                </span>
              ),
            },
          ]}
          rows={Array.from({ length: 8 }).map((_, i) => ({
            sku: `SKU-${2000 + i}`,
            name: `Sample Product ${i + 1}`,
            category: "General",
            price: `$${(12 + i * 3).toFixed(2)}`,
            stock: (i + 1) * 4,
          }))}
        />
      </section>
    </div>
  );
}
