"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import { Users, UserCheck, DollarSign } from "lucide-react";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";

export default function CustomerManagement() {
  const customers = [
    { id: "C-1001", name: "Jane Doe", orders: 12, lifetime: 420.5 },
    { id: "C-1002", name: "John Smith", orders: 2, lifetime: 75.0 },
    { id: "C-1003", name: "Mary Johnson", orders: 5, lifetime: 210.7 },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <span className="text-sm text-gray-500">
          View and manage customers and lifetime value.
        </span>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "total",
            title: "Total Customers",
            value: 4503,
            icon: Users,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "All customers",
          },
          {
            key: "active",
            title: "Active (30d)",
            value: 1120,
            icon: UserCheck,
            color: "#10b981",
            bgColor: "#f0fdf4",
            description: "Active users",
          },
          {
            key: "avg_ltv",
            title: "Avg. Lifetime Value",
            value: "$93.42",
            icon: DollarSign,
            color: "#a855f7",
            bgColor: "#faf5ff",
            description: "Average customer LTV",
          },
        ]}
      />

      <section>
        <EcommerceDataTable
          columns={[
            { id: "id", label: "Customer ID", accessor: "id" },
            { id: "name", label: "Name", accessor: "name" },
            { id: "orders", label: "Orders", accessor: "orders" },
            { id: "lifetime", label: "Lifetime ($)", accessor: "lifetime" },
          ]}
          rows={customers}
          keyField="id"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl border border-neutral-300">
          <h4 className="font-semibold mb-2">Recent Signups</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Anna — 2 days ago</li>
            <li>Victor — 3 days ago</li>
            <li>Hannah — 4 days ago</li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-xl border border-neutral-300">
          <h4 className="font-semibold mb-2">Customer segments</h4>
          <div className="text-sm text-gray-600">
            Retail: 68% • Wholesale: 18% • B2B: 14%
          </div>
        </div>
      </section>
    </div>
  );
}
