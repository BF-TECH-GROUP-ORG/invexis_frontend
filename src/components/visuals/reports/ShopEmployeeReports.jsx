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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl text-sm">
                <p className="font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ModernLegend = (props) => {
    const { payload } = props;
    return (
        <div className="flex justify-center gap-6 mt-4">
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300 transition-colors cursor-pointer">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const ShopEmployeeReports = ({ shopPerformance = [], employeePerformance = [], loading = false }) => {
    if (loading) {
        return (
            <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-[400px]">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-[400px]">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shop Performance */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Shop Performance</h3>
                        <p className="text-sm text-gray-500">Revenue distribution by branch</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shopPerformance} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="shopGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.4)" }} />
                                <Bar dataKey="value" name="Revenue" radius={[10, 10, 0, 0]} barSize={40} fill="url(#shopGradient)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employee Performance */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Employee Leaderboard</h3>
                        <p className="text-sm text-gray-500">Top performers by sales volume</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={employeePerformance}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                barSize={24}
                            >
                                <defs>
                                    <linearGradient id="employeeGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.4)" }} />
                                <Bar dataKey="value" name="Sales" radius={[0, 10, 10, 0]} fill="url(#employeeGradient)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ShopEmployeeReports);
