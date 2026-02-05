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

function ShopPerformanceReportPageContent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { name: "Downtown Branch", revenue: 45000 },
                    { name: "Mall Kiosk", revenue: 28000 },
                    { name: "Westside Store", revenue: 35000 },
                    { name: "Airport Outlet", revenue: 52000 },
                    { name: "Suburban Branch", revenue: 31000 },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch shop performance data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Performance</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{
                                top: 5,
                                right: 30,
                                left: 100,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={100} />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}


export default function ShopPerformanceReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ShopPerformanceReportPageContent />
        </Suspense>
    );
}

