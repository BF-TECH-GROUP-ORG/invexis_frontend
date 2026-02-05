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

function CustomerAcquisitionReportPageContent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { date: "Jan", newUsers: 45 },
                    { date: "Feb", newUsers: 52 },
                    { date: "Mar", newUsers: 38 },
                    { date: "Apr", newUsers: 65 },
                    { date: "May", newUsers: 48 },
                    { date: "Jun", newUsers: 72 },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch acquisition data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Acquisition</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
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
                            <Bar dataKey="newUsers" fill="#3b82f6" name="New Signups" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}


export default function CustomerAcquisitionReportPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <CustomerAcquisitionReportPageContent />
        </Suspense>
    );
}

