"use client";

import React from "react";
import SalesAnalyticsChart from "./SalesAnalyticsChart";
import ProductDistributionChart from "./ProductDistributionChart";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";
import { ShoppingCart, DollarSign, Users, UserPlus } from "lucide-react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";

// Mock data for charts
const salesData = [
  { month: "Jan", sales: 45000 },
  { month: "Feb", sales: 52000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 61000 },
  { month: "May", sales: 55000 },
  { month: "Jun", sales: 67000 },
];

const topProducts = [
  { name: "Laptops", value: 35 },
  { name: "Phones", value: 25 },
  { name: "Tablets", value: 20 },
  { name: "Accessories", value: 15 },
  { name: "Other", value: 5 },
];

export default function Overview() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">E-commerce Overview</h1>
        <p className="text-sm text-gray-500">
          All important KPIs and trends at a glance.
        </p>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "total",
            title: "Total Orders",
            value: 12403,
            icon: ShoppingCart,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "All orders",
          },
          {
            key: "revenue",
            title: "Revenue",
            value: "$412,450",
            icon: DollarSign,
            color: "#10b981",
            bgColor: "#f0fdf4",
            description: "Total revenue",
          },
          {
            key: "returning",
            title: "Returning Customers",
            value: 1114,
            icon: Users,
            color: "#a855f7",
            bgColor: "#faf5ff",
            description: "Returning customers",
          },
          {
            key: "new",
            title: "New Customers",
            value: 213,
            icon: UserPlus,
            color: "#ef4444",
            bgColor: "#fff1f2",
            description: "New this period",
          },
        ]}
        onFilter={() => {}}
        activeFilters={{}}
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesAnalyticsChart data={salesData} />

        <ProductDistributionChart data={topProducts} />
      </section>

      <section>
        <EcommerceDataTable
          columns={[
            { id: "orderId", label: "Order ID", accessor: "id" },
            { id: "customer", label: "Customer", accessor: "customer" },
            { id: "items", label: "Items", accessor: "items" },
            { id: "value", label: "Value", accessor: "value" },
            {
              id: "status",
              label: "Status",
              accessor: "status",
              render: (r) => (
                <span
                  className={
                    r.status === "Delivered"
                      ? "text-green-600"
                      : r.status === "Processing"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {r.status}
                </span>
              ),
            },
          ]}
          rows={[
            {
              id: "#INV-2034",
              customer: "Jane Doe",
              items: 3,
              value: "$152.00",
              status: "Delivered",
            },
            {
              id: "#INV-2033",
              customer: "John Smith",
              items: 1,
              value: "$20.00",
              status: "Processing",
            },
            {
              id: "#INV-2032",
              customer: "Acme Co.",
              items: 11,
              value: "$1,100.00",
              status: "Cancelled",
            },
          ]}
        />
      </section>
    </div>
  );
}
