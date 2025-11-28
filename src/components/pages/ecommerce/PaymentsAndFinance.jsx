"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import { DollarSign, RefreshCw, Wallet } from "lucide-react";
import EcommerceDataTable from "@/components/shared/EcommerceDataTable";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const revenue = [
  { month: "Jan", rev: 20000 },
  { month: "Feb", rev: 30000 },
  { month: "Mar", rev: 25000 },
  { month: "Apr", rev: 42000 },
  { month: "May", rev: 33000 },
  { month: "Jun", rev: 52000 },
];

export default function PaymentsAndFinance() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments & Finance</h1>
        <div className="text-sm text-gray-500">
          Revenue, refunds and fiscal summary.
        </div>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "gross",
            title: "Gross Revenue (30d)",
            value: "$142,320",
            icon: DollarSign,
            color: "#10b981",
            bgColor: "#f0fdf4",
            description: "30 day gross",
          },
          {
            key: "refunds",
            title: "Refunds",
            value: "$5,400",
            icon: RefreshCw,
            color: "#ef4444",
            bgColor: "#fff1f2",
            description: "Refunds amount",
          },
          {
            key: "net",
            title: "Net Revenue",
            value: "$136,920",
            icon: Wallet,
            color: "#a855f7",
            bgColor: "#faf5ff",
            description: "Net revenue",
          },
        ]}
      />

      <div className="p-4 bg-white rounded-xl border border-neutral-300 h-72">
        <h4 className="font-semibold mb-2">Revenue over time</h4>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="rev"
              stroke="#10b981"
              fill="url(#revGrad)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <section>
        <EcommerceDataTable
          columns={[
            { id: "date", label: "Date", accessor: "date" },
            { id: "tx", label: "Transaction", accessor: "transaction" },
            { id: "amount", label: "Amount", accessor: "amount" },
            { id: "method", label: "Method", accessor: "method" },
            { id: "status", label: "Status", accessor: "status" },
          ]}
          rows={[
            {
              date: "2025-11-26",
              transaction: "Payment #2022",
              amount: "$120.00",
              method: "Card",
              status: "Settled",
            },
            {
              date: "2025-11-25",
              transaction: "Refund #1999",
              amount: "$45.00",
              method: "Card",
              status: "Refunded",
            },
          ]}
        />
      </section>
    </div>
  );
}
