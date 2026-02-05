"use client";

import { useEffect, useState } from "react";
import AnalyticsService from "@/services/analyticsService";
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const SparklineCard = ({ title, value, data, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-4">{value}</p>
        <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.1}
                        strokeWidth={2}
                    />
                    <Tooltip
                        contentStyle={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                        itemStyle={{ color: 'transparent' }} // Hide text
                        cursor={{ stroke: '#e5e7eb' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default function PlatformHealthPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    // Mock data
    const activeCompaniesData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        value: 100 + Math.random() * 50,
    }));

    const eventThroughputData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        value: 5000 + Math.random() * 2000,
    }));

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Health</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SparklineCard
                        title="Active Companies (30d)"
                        value="142"
                        data={activeCompaniesData}
                        color="#3b82f6"
                    />
                    <SparklineCard
                        title="Event Throughput (Requests/min)"
                        value="6.2k"
                        data={eventThroughputData}
                        color="#10b981"
                    />
                </div>
            </div>
        </div>
    );
}
