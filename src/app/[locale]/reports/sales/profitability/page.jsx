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
    Line,
    ComposedChart
} from "recharts";

function ProfitabilityReportPageContent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { date: "Jan", cost: 10000, profit: 5000, margin: 33 },
                    { date: "Feb", cost: 12000, profit: 6500, margin: 35 },
                    { date: "Mar", cost: 14000, profit: 8000, margin: 36 },
                    { date: "Apr", cost: 13000, profit: 8000, margin: 38 },
                    { date: "May", cost: 16000, profit: 9000, margin: 36 },
                    { date: "Jun", cost: 18000, profit: 10000, margin: 35 },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch profitability data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profitability Analysis</h1>

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
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Margin (%)', angle: 90, position: 'insideRight' }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="cost" stackId="a" fill="#ef4444" name="Cost" />
                            <Bar yAxisId="left" dataKey="profit" stackId="a" fill="#22c55e" name="Profit" />
                            <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" name="Gross Margin %" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}


export default function ProfitabilityReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ProfitabilityReportPageContent />
        </Suspense>
    );
}

