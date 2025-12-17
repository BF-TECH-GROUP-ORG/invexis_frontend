"use client";
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const ShopEmployeeReports = ({ shopPerformance = [], employeePerformance = [], loading = false }) => {
    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading performance data...</div>;
    }

    return (
        <div className="space-y-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800">Performance Reports</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shop Performance */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Shop Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shopPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employee Performance */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Employee Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={employeePerformance} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#475569', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#ec4899" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopEmployeeReports;
