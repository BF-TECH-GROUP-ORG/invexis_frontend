"use client";

import { useEffect, useState } from "react";
import AnalyticsService from "@/services/analyticsService";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function ActiveUsersReportPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                const mockData = [
                    { date: "00:00", users: 120 },
                    { date: "04:00", users: 80 },
                    { date: "08:00", users: 450 },
                    { date: "12:00", users: 890 },
                    { date: "16:00", users: 760 },
                    { date: "20:00", users: 540 },
                    { date: "23:59", users: 230 },
                ];
                setData(mockData);
            } catch (error) {
                console.error("Failed to fetch active users data", error);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Users (24h)</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
