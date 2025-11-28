"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";
import { Truck, Clock, AlertTriangle } from "lucide-react";

export default function ShippingLogistics() {
  const shipments = [
    {
      id: "SHIP-9001",
      carrier: "FastShip",
      eta: "2025-11-28",
      status: "In Transit",
    },
    {
      id: "SHIP-9000",
      carrier: "QuickFreight",
      eta: "2025-11-27",
      status: "Dispatched",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipping & Logistics</h1>
        <div className="text-sm text-gray-500">
          Manage carriers, shipments and tracking insights.
        </div>
      </header>
      <EcommerceAnalyticsCards
        cards={[
          {
            key: "active",
            title: "Active Shipments",
            value: 18,
            icon: Truck,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "Active shipments",
          },
          {
            key: "avg",
            title: "Avg Transit Time",
            value: "3.9 days",
            icon: Clock,
            color: "#a855f7",
            bgColor: "#faf5ff",
            description: "Average transit",
          },
          {
            key: "delayed",
            title: "Delayed",
            value: 2,
            icon: AlertTriangle,
            color: "#ef4444",
            bgColor: "#fff1f2",
            description: "Delayed shipments",
          },
        ]}
      />

      <section>
        <EcommerceDataTable
          columns={[
            { id: "id", label: "Shipment ID", accessor: "id" },
            { id: "carrier", label: "Carrier", accessor: "carrier" },
            { id: "eta", label: "ETA", accessor: "eta" },
            { id: "status", label: "Status", accessor: "status" },
            { id: "origin", label: "Origin", accessor: () => "Nairobi" },
          ]}
          rows={shipments}
          keyField="id"
        />
      </section>
    </div>
  );
}
