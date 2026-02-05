"use client";

import React from "react";
import Link from "next/link";

const items = [
  { title: "Overview", path: "/inventory/ecommerce/overview" },
  { title: "Product List", path: "/inventory/ecommerce/products" },
  {
    title: "Inventory Management",
    path: "/inventory/ecommerce/inventory_management",
  },
  {
    title: "Customer Management",
    path: "/inventory/ecommerce/customer_management",
  },
  { title: "Order Management", path: "/inventory/ecommerce/order_management" },
  {
    title: "Payments & Finance",
    path: "/inventory/ecommerce/payments_and_finance",
  },
  {
    title: "Shipping & Logistics",
    path: "/inventory/ecommerce/shippint_and_logistics",
  },
  {
    title: "Marketing Management",
    path: "/inventory/ecommerce/marketing_management",
  },
  { title: "Reviews", path: "/inventory/ecommerce/reveiews" },
];

export default function EcommerceIndex() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">E-commerce</h1>
        <div className="text-sm text-gray-500">
          Quick links to E-commerce sections
        </div>
      </header>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.path}
            href={it.path}
            className="block p-4 bg-white rounded-xl border border-neutral-300 hover:border-neutral-400 transition"
          >
            <div className="text-lg font-semibold">{it.title}</div>
            <div className="text-sm text-gray-500 mt-1">Open {it.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
