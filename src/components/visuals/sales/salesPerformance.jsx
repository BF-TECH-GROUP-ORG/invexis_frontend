"use client";
import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// --- Mock Data ---

const salesPerformanceData = [
    { name: 'Mon', current: 4000, previous: 2400 },
    { name: 'Tue', current: 3000, previous: 1398 },
    { name: 'Wed', current: 2000, previous: 9800 },
    { name: 'Thu', current: 2780, previous: 3908 },
    { name: 'Fri', current: 1890, previous: 4800 },
    { name: 'Sat', current: 2390, previous: 3800 },
    { name: 'Sun', current: 3490, previous: 4300 },
];

const categoryData = [
    { name: 'Electronics', value: 45, color: '#6366f1' }, // Indigo 500
    { name: 'Clothing', value: 20, color: '#ec4899' },    // Pink 500
    { name: 'Home & Garden', value: 15, color: '#10b981' }, // Emerald 500
    { name: 'Books', value: 10, color: '#f59e0b' },      // Amber 500
    { name: 'Others', value: 10, color: '#64748b' },      // Slate 500
];

const topProductsData = [
    { name: 'Wireless Earbuds', quantity: 120 },
    { name: 'Smart Watch Gen 4', quantity: 98 },
    { name: 'Ergonomic Chair', quantity: 86 },
    { name: 'Mechanical Keyboard', quantity: 72 },
    { name: 'USB-C Hub', quantity: 65 },
];

const stockData = [
    { name: 'Mon', in: 40, out: 24 },
    { name: 'Tue', in: 30, out: 13 },
    { name: 'Wed', in: 20, out: 98 },
    { name: 'Thu', in: 27, out: 39 },
    { name: 'Fri', in: 18, out: 48 },
    { name: 'Sat', in: 23, out: 38 },
    { name: 'Sun', in: 34, out: 43 },
];

const SalesPerformance = () => {
    const [timeRange, setTimeRange] = useState('Weekly');
    const [selectedDate, setSelectedDate] = useState(dayjs());

    return (
        <div className="space-y-6">

            {/* --- (A) Sales Performance Chart --- */}
            <br />
            <div className="bg-white p-6 rounded-2xl border border-gray-300 ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Sales Performance</h2>
                        <p className="text-sm text-gray-500">
                            Comparing <span className="text-indigo-500 font-medium">Current</span> vs <span className="text-orange-400 font-medium">Previous</span> {timeRange}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Compare with"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: { width: 150 }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                        <div className="flex bg-gray-50 rounded-lg p-1">
                            {['Daily', 'Weekly', 'Monthly'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer  width="100%" height="100%">
                        <AreaChart  data={salesPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3"  stroke="gray" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="previous"
                                stroke="#fb923c"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrevious)"
                                dot={{ r: 4, fill: '#fff', stroke: '#fb923c', strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCurrent)"
                                dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- (B) Sales by Product Category --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300  flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Sales by Category</h2>
                        <p className="text-sm text-gray-500">Distribution across departments</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        cornerRadius={10}

                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}

                        </div>
                        {/* Legend */}
                        <div className="ml-4 space-y-2">
                            {categoryData.map((item) => (
                                <div key={item.name} className="flex items-center text-sm">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                    <span className="ml-auto text-gray-400 pl-4">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- (C) Top 5 Best-Selling Products --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Top Products</h2>
                            <p className="text-sm text-gray-500">Best performing items</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={topProductsData}
                                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                                barSize={20}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 10, 20, 0]} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] }}>
                                    {
                                        topProductsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? '#f97316' : '#94a3b8'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* --- (D) Stock In vs Stock Out --- */}
            <div className="bg-white p-6 rounded-2xl border border-gray-300 ">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Inventory Stastics</h2>
                        <p className="text-sm text-gray-500">Inbound vs Outbound inventory</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                            <span className="text-gray-600">Stock In</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                            <span className="text-gray-600">Stock Out</span>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockData} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="in" fill="#10b981" radius={[10, 10, 0, 0]} barSize={80} />
                            <Bar dataKey="out" fill="#f97316" radius={[10, 10, 0, 0]} barSize={80} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default SalesPerformance;
