"use client";
import React from 'react';
import Skeleton from '@/components/shared/Skeleton';
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

const THEME_COLORS = ["#081422", "#ea580c", "#fb923c", "#94a3b8", "#cbd5e1"];

const ShopEmployeeReports = ({ shopPerformance = [], employeePerformance = [], loading = false }) => {
    if (loading) {
        return (
            <div className="space-y-6 mt-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-300 h-[400px]">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <div className="flex items-end justify-around h-[300px] pb-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className={`w-12 rounded-t-lg`} style={{ height: `${Math.random() * 60 + 20}%` }} />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-300 h-[400px]">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="space-y-4 pt-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 flex-1 rounded-r-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
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
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                                    {shopPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employee Performance */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Employee Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={employeePerformance} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {employeePerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={THEME_COLORS[(index + 1) % THEME_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopEmployeeReports;
