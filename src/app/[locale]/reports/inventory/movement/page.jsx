"use client";

import { useEffect, useState, Suspense } from "react";
import AnalyticsService from "@/services/analyticsService";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function StockMovementReportPageContent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { date: "Mon", stockIn: 50, stockOut: 45, netFlow: 5 },
                    { date: "Tue", stockIn: 30, stockOut: 40, netFlow: -10 },
                    { date: "Wed", stockIn: 60, stockOut: 55, netFlow: 5 },
                    { date: "Thu", stockIn: 40, stockOut: 30, netFlow: 10 },
                    { date: "Fri", stockIn: 70, stockOut: 80, netFlow: -10 },
                    { date: "Sat", stockIn: 90, stockOut: 85, netFlow: 5 },
                    { date: "Sun", stockIn: 20, stockOut: 15, netFlow: 5 },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch stock movement data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Stock Movement</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="stockIn" fill="#22c55e" name="Stock In" />
                            <Bar dataKey="stockOut" fill="#ef4444" name="Stock Out" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}


export default function StockMovementReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <StockMovementReportPageContent />
        </Suspense>
    );
}

