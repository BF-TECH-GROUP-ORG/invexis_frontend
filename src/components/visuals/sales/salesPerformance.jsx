"use client";
import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
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
    Legend,
    ComposedChart,
    Rectangle
} from 'recharts';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Skeleton from '@/components/shared/Skeleton';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#64748b', '#8b5cf6', '#ef4444'];
const THEME_COLORS = ["#081422", "#ea580c", "#fb923c", "#94a3b8", "#cbd5e1"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl text-sm">
                <p className="font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-4 mb-1 last:mb-0"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color }}
                            ></span>
                            <span className="text-gray-600 dark:text-gray-300">
                                {entry.name}
                            </span>
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
                <div
                    key={`item-${index}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
                >
                    <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

const SalesPerformance = ({
    timeRange,
    setTimeRange,
    selectedDate,
    setSelectedDate,
    salesData = [],
    categoryData = [],
    topProductsData = [],
    stockData = [],
    profitabilityData = [],
    loading = false
}) => {
    const t = useTranslations('dashboard');
    // ... (rest of the component logic remains same until return)

    const safeCategoryData = Array.isArray(categoryData) ? categoryData : [];
    const processedCategoryData = safeCategoryData.map((item, index) => ({
        ...item,
        color: item.color || THEME_COLORS[index % THEME_COLORS.length]
    }));

    const safeSalesData = Array.isArray(salesData) ? salesData : [];
    const safeTopProductsData = Array.isArray(topProductsData) ? topProductsData : [];
    const safeStockData = Array.isArray(stockData) ? stockData : [];
    const safeProfitabilityData = Array.isArray(profitabilityData) ? profitabilityData : [];

    if (loading) {
        return (
            <div className="space-y-6">
                <br />
                <div className="bg-white p-6 rounded-2xl border border-gray-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-[400px]">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-6" />
                        <div className="flex items-center justify-around h-full pb-10">
                            <Skeleton variant="circle" className="h-64 w-64" />
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-[400px]">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-8 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* --- (A) Sales Performance Chart --- */}
            <br />
            <div className="bg-white p-6 rounded-2xl border border-gray-300 ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{t('salesPerformance')}</h2>
                        <p className="text-sm text-gray-500">
                            {t('comparing')} <span className="text-indigo-500 font-medium">{t('current')}</span> {t('vs')} <span className="text-orange-400 font-medium">{t('previous')}</span> {timeRange}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label={t('compareWith')}
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
                            {['24h', '7d', '30d', '90d', '1y'].map((range) => (
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
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={safeProfitabilityData} margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                            <defs>
                                <pattern
                                    id="striped-pattern"
                                    patternUnits="userSpaceOnUse"
                                    width="4"
                                    height="4"
                                    patternTransform="rotate(45)"
                                >
                                    <rect
                                        width="2"
                                        height="4"
                                        transform="translate(0,0)"
                                        fill="#081422"
                                        opacity="0.1"
                                    />
                                </pattern>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                                vertical={false}
                                strokeOpacity={0.6}
                            />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                                tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                            />
                            <Legend content={<ModernLegend />} />

                            <Bar
                                dataKey="revenue"
                                name={t('revenue')}
                                barSize={32}
                                fill="url(#barGradient)"
                                radius={[12, 12, 0, 0]}
                            />
                            <Bar
                                dataKey="cost"
                                name={t('cost')}
                                barSize={32}
                                fill="#081422"
                                radius={[12, 12, 0, 0]}
                            >
                                {safeProfitabilityData.map((entry, index) => (
                                    <Rectangle
                                        key={`rect-${index}`}
                                        fill="#081422"
                                        stroke="none"
                                        radius={[12, 12, 0, 0]}
                                    />
                                ))}
                            </Bar>
                            <Bar
                                dataKey="cost"
                                name={t('cost')}
                                barSize={32}
                                fill="url(#striped-pattern)"
                                radius={[12, 12, 0, 0]}
                                legendType="none"
                                tooltipType="none"
                                style={{ pointerEvents: "none" }}
                            />

                            <Line
                                type="monotone"
                                dataKey="profit"
                                name={t('profit')}
                                stroke="#fb923c"
                                strokeWidth={4}
                                dot={{ r: 6, fill: "#fff", strokeWidth: 3, stroke: "#fb923c" }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: "#ea580c" }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- (B) Sales by Payment Method & (C) Top 5 Best-Selling Products --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full mb-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('salesByPaymentMethod')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('distributionByPayment')}</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center w-full justify-around gap-8">
                        <div className="h-64 w-64 flex-shrink-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={processedCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={85}
                                        outerRadius={115}
                                        paddingAngle={4}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {processedCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg text-xs">
                                                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {payload[0].name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: payload[0].payload.fill }}
                                                            ></span>
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {payload[0].value.toLocaleString()} {t('transactions')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {processedCategoryData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">
                                    {t('totalSales')}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-3 w-full md:w-auto">
                            {processedCategoryData.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between text-sm group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-xl border border-transparent hover:border-gray-100 transition-all w-full min-w-[180px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-gray-100 dark:ring-gray-700"
                                            style={{ backgroundColor: item.color }}
                                        ></span>
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white ml-6 tabular-nums">
                                        {item.value.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* --- (C) Top 5 Best-Selling Products --- */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{t('topProductsTitle')}</h2>
                            <p className="text-sm text-gray-500">{t('bestPerformingItems')}</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={safeTopProductsData}
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
                                    tickFormatter={(name) => name.length > 15 ? `${name.substring(0, 15)}...` : name}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name, props) => [value, props.payload.name]}
                                />
                                <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 10, 20, 0]} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] }}>
                                    {
                                        safeTopProductsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- (D) Inventory Statistics --- */}
            <div className="bg-white p-6 rounded-2xl border border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{t('inventoryStatistics')}</h2>
                        <p className="text-sm text-gray-500">
                            {t('inbound')} <span className="text-emerald-500 font-medium">{t('stockIn')}</span> {t('vs')} {t('outbound')} <span className="text-orange-400 font-medium">{t('stockOut')}</span>
                        </p>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={safeStockData} margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
                            <defs>
                                <linearGradient id="stockInGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="stockOutGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                                vertical={false}
                                strokeOpacity={0.6}
                            />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                                dy={15}
                                padding={{ left: 0, right: 0 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                                tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                                domain={[0, 'auto']}
                                dx={-10}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                            />
                            <Legend content={<ModernLegend />} />

                            <Bar
                                dataKey="in"
                                name={t('stockIn')}
                                barSize={36}
                                fill="url(#stockInGradient)"
                                radius={[12, 12, 0, 0]}
                            />
                            <Bar
                                dataKey="out"
                                name={t('stockOut')}
                                barSize={36}
                                fill="url(#stockOutGradient)"
                                radius={[12, 12, 0, 0]}
                            />
                            <Line
                                type="monotone"
                                dataKey="net"
                                name={t('netFlow')}
                                stroke="#081422"
                                strokeWidth={4}
                                dot={{ r: 6, fill: "#fff", strokeWidth: 3, stroke: "#081422" }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: "#081422" }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default memo(SalesPerformance);


