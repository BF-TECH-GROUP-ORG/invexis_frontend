"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import { List, Clock, Truck } from "lucide-react";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";

export default function OrderManagement() {
  const orders = [
    {
      id: "ORD-20245",
      customer: "Jane Doe",
      total: 220.5,
      status: "Delivered",
    },
    {
      id: "ORD-20244",
      customer: "John Smith",
      total: 82.0,
      status: "Processing",
    },
    {
      id: "ORD-20243",
      customer: "Acme Corp",
      total: 1200.0,
      status: "Shipped",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="text-sm text-gray-500">
          Process, filter and export orders.
        </div>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "open",
            title: "Open Orders",
            value: 120,
            icon: List,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "Orders awaiting fulfillment",
          },
          {
            key: "avg",
            title: "Avg Fulfillment",
            value: "2.4 days",
            icon: Clock,
            color: "#a855f7",
            bgColor: "#faf5ff",
            description: "Average fulfillment time",
          },
          {
            key: "late",
            title: "Late Shipments",
            value: 12,
            icon: Truck,
            color: "#ef4444",
            bgColor: "#fff1f2",
            description: "Delayed shipments",
          },
        ]}
      />

      <section>
        <EcommerceDataTable
          columns={[
            { id: "id", label: "Order ID", accessor: "id" },
            { id: "customer", label: "Customer", accessor: "customer" },
            {
              id: "total",
              label: "Value",
              accessor: "total",
              render: (r) => `$${Number(r.total).toFixed(2)}`,
            },
            { id: "status", label: "Status", accessor: "status" },
          ]}
          rows={orders}
          keyField="id"
        />
      </section>

      <section className="p-4 bg-white rounded-xl border border-neutral-300">
        <h4 className="font-semibold mb-3">Order pipeline (quick view)</h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 border rounded text-center">
            New
            <br />
            <span className="font-bold">24</span>
          </div>
          <div className="p-3 border rounded text-center">
            Processing
            <br />
            <span className="font-bold">54</span>
          </div>
          <div className="p-3 border rounded text-center">
            Fulfilled
            <br />
            <span className="font-bold">192</span>
          </div>
        </div>
      </section>
    </div>
  );
}
