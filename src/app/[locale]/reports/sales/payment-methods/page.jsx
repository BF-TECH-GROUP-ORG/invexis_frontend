"use client";

import { useEffect, useState, Suspense } from "react";
import AnalyticsService from "@/services/analyticsService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function PaymentMethodsReportPageContent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bestMethod, setBestMethod] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { name: "Cash", value: 400 },
                    { name: "Card", value: 300 },
                    { name: "Mobile Money", value: 300 },
                    { name: "Other", value: 100 },
                ];
                setData(mockData);

                // Determine best method
                const best = mockData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
                setBestMethod(best);
            } catch (error) {
                console.error("Failed to fetch payment methods data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Methods</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Chart Section */}
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={160}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Best Performing Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Most Popular Method</h2>
                        {bestMethod && (
                            <>
                                <p className="text-3xl font-bold text-blue-600 mb-2">{bestMethod.name}</p>
                                <p className="text-gray-500">
                                    {Math.round((bestMethod.value / data.reduce((a, b) => a + b.value, 0)) * 100)}% of transactions
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function PaymentMethodsReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <PaymentMethodsReportPageContent />
        </Suspense>
    );
}

