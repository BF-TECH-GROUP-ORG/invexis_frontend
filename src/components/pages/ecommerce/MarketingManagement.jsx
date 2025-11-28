"use client";

import React from "react";
import EcommerceAnalyticsCards from "./EcommerceAnalyticsCards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const campaigns = [
  { name: "FB Ads", conversions: 120 },
  { name: "Google", conversions: 210 },
  { name: "Email", conversions: 45 },
  { name: "Organic", conversions: 340 },
];

export default function MarketingManagement() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketing Management</h1>
        <div className="text-sm text-gray-500">
          Campaign performance and conversion tracking.
        </div>
      </header>

      <EcommerceAnalyticsCards
        cards={[
          {
            key: "active",
            title: "Active Campaigns",
            value: 18,
            icon: () => null,
            color: "#ff782d",
            bgColor: "#fff8f5",
            description: "Running campaigns",
          },
          {
            key: "conversions",
            title: "Monthly Conversions",
            value: 1120,
            icon: () => null,
            color: "#10b981",
            bgColor: "#f0fdf4",
            description: "Conversions this month",
          },
          {
            key: "cpa",
            title: "CPA",
            value: "$13.40",
            icon: () => null,
            color: "#a855f7",
            bgColor: "#faf5ff",
            description: "Cost per acquisition",
          },
        ]}
      />

      <div className="p-4 bg-white rounded-xl border border-neutral-300 h-72">
        <h4 className="font-semibold mb-2">Campaign conversions</h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={campaigns}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="conversions" fill="#6366f1" radius={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <section className="p-4 bg-white rounded-xl border border-neutral-300">
        <h4 className="font-semibold mb-3">Recent leads</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Lead: Chris — Email: chris@company.test — Source: Google</li>
          <li>Lead: Dina — Email: dina@shop.test — Source: Facebook</li>
        </ul>
      </section>
    </div>
  );
}
