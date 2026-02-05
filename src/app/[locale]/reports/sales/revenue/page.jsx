"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AnalyticsService from "@/services/analyticsService";
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function RevenueReportPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data for now
                // const result = await AnalyticsService.getRevenueReport({ period: '1y', interval: 'month' });
                // setData(result.data);

                const mockData = [
                    { date: "Jan", revenue: 15000, orderCount: 120 },
                    { date: "Feb", revenue: 18500, orderCount: 145 },
                    { date: "Mar", revenue: 22000, orderCount: 160 },
                    { date: "Apr", revenue: 21000, orderCount: 150 },
                    { date: "May", revenue: 25000, orderCount: 180 },
                    { date: "Jun", revenue: 28000, orderCount: 200 },
                    { date: "Jul", revenue: 26000, orderCount: 190 },
                    { date: "Aug", revenue: 30000, orderCount: 220 },
                    { date: "Sep", revenue: 32000, orderCount: 240 },
                    { date: "Oct", revenue: 35000, orderCount: 260 },
                    { date: "Nov", revenue: 38000, orderCount: 280 },
                    { date: "Dec", revenue: 42000, orderCount: 310 },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch revenue data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Revenue & Order Count</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            }}
                        >
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="date" scale="band" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Orders', angle: 90, position: 'insideRight' }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#413ea0" name="Revenue" />
                            <Line yAxisId="right" type="monotone" dataKey="orderCount" stroke="#ff7300" name="Order Count" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
