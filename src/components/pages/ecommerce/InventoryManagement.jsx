"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";
import { Package, AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const movement = [
  { date: "2025-05-01", in: 120, out: 40 },
  { date: "2025-06-01", in: 200, out: 70 },
  { date: "2025-07-01", in: 90, out: 30 },
  { date: "2025-08-01", in: 300, out: 210 },
  { date: "2025-09-01", in: 170, out: 100 },
  { date: "2025-10-01", in: 220, out: 140 },
];

export default function InventoryManagement() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="text-sm text-gray-500">
          Track inbound/outbound stock, critical levels and alerts.
        </div>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "total_stock",
            title: "Total Stock",
            value: "15,230",
            icon: Package,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "Current stock",
          },
          {
            key: "low_stock",
            title: "Low Stock",
            value: 42,
            icon: AlertTriangle,
            color: "#ef4444",
            bgColor: "#fff1f2",
            description: "Low stock products",
          },
          {
            key: "outgoing",
            title: "Outgoing Today",
            value: 370,
            icon: ArrowUpRight,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            description: "Outgoing orders",
          },
        ]}
      />

      <div className="p-4 bg-white rounded-xl border border-neutral-300 h-80">
        <h4 className="font-semibold mb-2">Stock Movement (in / out)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={movement}>
            <defs>
              <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00b894" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00b894" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4757" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ff4757" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="natural"
              dataKey="in"
              stroke="#00b894"
              fill="url(#gradIn)"
              strokeWidth={3}
            />
            <Area
              type="natural"
              dataKey="out"
              stroke="#ff4757"
              fill="url(#gradOut)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <EcommerceDataTable
            columns={[
              { id: "sku", label: "SKU", accessor: (r) => r },
              { id: "updated", label: "Last updated", accessor: "updated" },
            ]}
            rows={[
              {
                id: "SKU-1001",
                name: "SKU-1001",
                sku: "SKU-1001",
                updated: "2 hours ago",
              },
              {
                id: "SKU-1002",
                name: "SKU-1002",
                sku: "SKU-1002",
                updated: "4 hours ago",
              },
              {
                id: "SKU-2001",
                name: "SKU-2001",
                sku: "SKU-2001",
                updated: "1 day ago",
              },
            ]}
            keyField="sku"
            showSearch={false}
          />
        </div>

        <div className="p-4 bg-white rounded-xl border border-neutral-300">
          <h4 className="font-semibold mb-3">Critical Stock Alerts</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-red-600">
            <li>Product D — stock 3</li>
            <li>Product Z — stock 2</li>
            <li>Product X — stock 1</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
