"use client";

import { useEffect, useState } from "react";
import AnalyticsService from "@/services/analyticsService";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;
const cx = 150;
const cy = 200;
const iR = 50;
const oR = 100;
const value = 50;

const needle = (value, data, cx, cy, iR, oR, color) => {
    let total = 0;
    data.forEach((v) => {
        total += v.value;
    });
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx + 5;
    const y0 = cy + 5;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return [
        <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" key="circle" />,
        <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="#none" fill={color} key="path" />,
    ];
};

export default function InventoryHealthReportPage() {
    const [turnoverRate, setTurnoverRate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock data
                // Simulate a turnover rate between 0 and 100
                setTurnoverRate(75);
            } catch (error) {
                console.error("Failed to fetch inventory health data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const data = [
        { name: 'Low', value: 33, color: '#ff0000' },
        { name: 'Medium', value: 33, color: '#ffff00' },
        { name: 'High', value: 34, color: '#00ff00' },
    ];

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory Health</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales Velocity (Turnover Rate)</h2>
                        <div className="h-[300px] w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        dataKey="value"
                                        startAngle={180}
                                        endAngle={0}
                                        data={data}
                                        cx="50%"
                                        cy="70%"
                                        innerRadius={80}
                                        outerRadius={140}
                                        fill="#8884d8"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    {needle(turnoverRate, data, 250, 210, 80, 140, '#d0d000')}
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-[-40px]">
                            <p className="text-2xl font-bold">{turnoverRate}%</p>
                            <p className="text-gray-500">Current Rate</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Key Insights</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                <div>
                                    <p className="font-medium">Healthy Turnover</p>
                                    <p className="text-sm text-gray-500">Your inventory is moving at a healthy pace.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                                <div>
                                    <p className="font-medium">Stock Alerts</p>
                                    <p className="text-sm text-gray-500">3 items are low in stock.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
