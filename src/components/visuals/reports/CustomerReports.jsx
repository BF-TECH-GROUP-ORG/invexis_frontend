"use client";
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const CustomerReports = ({ acquisitionData = [], activeUsersData = [], topCustomersData = [], loading = false }) => {
    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading customer data...</div>;
    }

    return (
        <div className="space-y-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800">Customer Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Acquisition */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">New Customer Acquisition</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={acquisitionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Active Users Over Time</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activeUsersData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white p-6 rounded-2xl border border-gray-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top Customers</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topCustomersData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={20}>
                                {topCustomersData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index < 3 ? '#8b5cf6' : '#cbd5e1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CustomerReports;
