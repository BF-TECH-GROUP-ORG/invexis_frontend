"use client";
import React from 'react';
import { ShoppingBag, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import SalesPerformance from '@/components/visuals/sales/salesPerformance';
import ShopEmployeeReports from '@/components/visuals/reports/ShopEmployeeReports';
import Skeleton from "@/components/shared/Skeleton";
import dayjs from 'dayjs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SalesReportsClient = ({ initialData }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const {
        summary = {},
        salesPerformance = [],
        profitabilityData = [],
        topProducts = [],
        categories = [],
        shopPerformance = [],
        employeePerformance = [],
        timeRange = '7d',
        selectedDate = dayjs().format('YYYY-MM-DD'),
        loading = false
    } = initialData;

    const currentSelectedDate = dayjs(selectedDate);

    // Update URL when filters change
    const updateFilters = (newTimeRange, newDate) => {
        const params = new URLSearchParams(searchParams);
        if (newTimeRange) params.set('timeRange', newTimeRange);
        if (newDate) params.set('date', newDate.format('YYYY-MM-DD'));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const headerCards = [
        {
            title: "Total Daily Sales",
            value: summary.totalDailySales || 0,
            icon: <ShoppingBag size={24} className="text-orange-500" />,
            bgColor: "bg-orange-50"
        },
        {
            title: "Total Revenue",
            value: `$${(summary.totalRevenue || 0).toLocaleString()}`,
            icon: <DollarSign size={24} className="text-emerald-500" />,
            bgColor: "bg-emerald-50"
        },
        {
            title: "Total Profit",
            value: `$${(summary.totalProfit || 0).toLocaleString()}`,
            icon: <TrendingUp size={24} className="text-blue-500" />,
            bgColor: "bg-blue-50"
        },
        {
            title: "Transactions",
            value: summary.totalOrders || 0,
            icon: <CreditCard size={24} className="text-purple-500" />,
            bgColor: "bg-purple-50"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
                        <p className="text-gray-500 mt-1">Detailed analysis of sales performance and trends</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        [...Array(4)].map((_, idx) => (
                            <div key={`skeleton-${idx}`} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                            </div>
                        ))
                    ) : (
                        headerCards.map((card, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Main Performance Charts */}
                <SalesPerformance
                    timeRange={timeRange}
                    setTimeRange={(v) => updateFilters(v, null)}
                    selectedDate={currentSelectedDate}
                    setSelectedDate={(v) => updateFilters(null, v)}
                    salesData={salesPerformance}
                    profitabilityData={profitabilityData}
                    topProductsData={topProducts}
                    categoryData={categories}
                    loading={loading}
                />

                {/* Shop & Employee Performance */}
                <ShopEmployeeReports
                    shopPerformance={shopPerformance}
                    employeePerformance={employeePerformance}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default SalesReportsClient;
