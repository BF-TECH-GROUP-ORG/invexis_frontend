"use client";
import React, { useState } from 'react';
import { Store, Users, Boxes, CircleX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SalesPerformance from '@/components/visuals/sales/salesPerformance';
import CustomerReports from '@/components/visuals/reports/CustomerReports';
import ShopEmployeeReports from '@/components/visuals/reports/ShopEmployeeReports';
import AnalyticsService from '@/services/analyticsService';
import dayjs from 'dayjs';

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const dateStr = selectedDate.format('YYYY-MM-DD');

    // Calculate backend params based on timeRange
    const getQueryParams = () => {
        const end = selectedDate;
        let start;
        let interval;

        switch (timeRange) {
            case '24h':
                start = end.subtract(1, 'day');
                interval = 'hour';
                break;
            case '7d':
                start = end.subtract(7, 'day');
                interval = 'day';
                break;
            case '30d':
                start = end.subtract(30, 'day');
                interval = 'day';
                break;
            case '90d':
                start = end.subtract(90, 'day');
                interval = 'day'; // or 'week' if supported, but backend uses day/month/hour
                break;
            case '1y':
                start = end.subtract(1, 'year');
                interval = 'month';
                break;
            default:
                start = end.subtract(7, 'day');
                interval = 'day';
        }

        return {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            interval
        };
    };

    const params = getQueryParams();

    // --- Queries ---

    // 1. Dashboard Summary
    const { data: summaryRes, isLoading: summaryLoading } = useQuery({
        queryKey: ['analytics', 'summary', params],
        queryFn: () => AnalyticsService.getDashboardSummary(params),
        staleTime: 60 * 1000, // 1 minute
    });

    // 2. Sales Revenue
    const { data: salesRes, isLoading: salesLoading } = useQuery({
        queryKey: ['analytics', 'sales', params],
        queryFn: () => AnalyticsService.getRevenueReport(params),
        staleTime: 5 * 60 * 1000,
    });

    // 3. Profitability
    const { data: profitabilityRes, isLoading: profitabilityLoading } = useQuery({
        queryKey: ['analytics', 'profitability', params],
        queryFn: () => AnalyticsService.getProfitabilityReport(params),
        staleTime: 5 * 60 * 1000,
    });

    // 4. Top Products
    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: ['analytics', 'products', params],
        queryFn: () => AnalyticsService.getTopProducts(params),
        staleTime: 5 * 60 * 1000,
    });

    // 5. Inventory Health
    const { data: inventoryRes, isLoading: inventoryLoading } = useQuery({
        queryKey: ['analytics', 'inventory', params],
        queryFn: () => AnalyticsService.getInventoryHealth(params),
        staleTime: 5 * 60 * 1000,
    });

    // 6. Payment Methods (Categories)
    const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
        queryKey: ['analytics', 'paymentMethods', params],
        queryFn: () => AnalyticsService.getPaymentMethodStats(params),
        staleTime: 5 * 60 * 1000,
    });

    // 7. Customer Stats
    const { data: acquisitionRes, isLoading: acquisitionLoading } = useQuery({
        queryKey: ['analytics', 'acquisition', params],
        queryFn: () => AnalyticsService.getNewCustomerStats(params),
        staleTime: 5 * 60 * 1000,
    });

    const { data: activeUsersRes, isLoading: activeUsersLoading } = useQuery({
        queryKey: ['analytics', 'activeUsers', params],
        queryFn: () => AnalyticsService.getActiveUsers(params),
        staleTime: 5 * 60 * 1000,
    });

    const { data: topCustomersRes, isLoading: topCustomersLoading } = useQuery({
        queryKey: ['analytics', 'topCustomers', params],
        queryFn: () => AnalyticsService.getTopCustomers(params),
        staleTime: 5 * 60 * 1000,
    });

    // 8. Shop & Employee Performance
    const { data: shopRes, isLoading: shopLoading } = useQuery({
        queryKey: ['analytics', 'shops', params],
        queryFn: () => AnalyticsService.getShopPerformance(params),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const { data: employeeRes, isLoading: employeeLoading } = useQuery({
        queryKey: ['analytics', 'employees', params],
        queryFn: () => AnalyticsService.getEmployeePerformance(params),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const loading = summaryLoading || salesLoading || profitabilityLoading || productsLoading || inventoryLoading || categoriesLoading || acquisitionLoading || activeUsersLoading || topCustomersLoading || shopLoading || employeeLoading;

    // --- Data Transformation ---

    // Summary Data
    const summary = summaryRes?.data || summaryRes || {};

    // Sales Performance
    const rawSales = salesRes?.data || [];
    const salesPerformance = rawSales.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        current: parseFloat(item.revenue) || 0,
        previous: 0
    }));

    // Profitability
    // API: [{"date":"...","revenue":"98.00","cost":"9.00","profit":"89.00","grossMarginPercent":"..."}]
    const rawProfitability = profitabilityRes?.data || [];
    const profitabilityData = rawProfitability.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        revenue: parseFloat(item.revenue) || 0,
        cost: parseFloat(item.cost) || 0,
        profit: parseFloat(item.profit) || 0,
        margin: parseFloat(item.grossMarginPercent) || 0
    }));

    // Top Products
    const rawProducts = productsRes?.data || [];
    const topProducts = rawProducts.map(item => ({
        name: item.productName || 'Unknown',
        quantity: parseInt(item.totalQuantity) || 0
    }));

    // Payment Methods
    const rawCategories = categoriesRes?.data || [];
    const categories = rawCategories.map(item => ({
        name: item.method || 'Unknown',
        value: parseInt(item.count) || 0
    }));

    // Shop Performance
    const rawShops = shopRes?.data || [];
    const shopPerformance = rawShops.map(item => ({
        name: `Shop ${item.shopId?.slice(0, 4)}...`,
        value: parseFloat(item.totalRevenue) || 0
    }));

    // Employee Performance
    const rawEmployees = employeeRes?.data || [];
    const employeePerformance = rawEmployees.map(item => ({
        name: `Emp ${item.employeeId?.slice(0, 4)}...`,
        value: parseFloat(item.totalSales) || 0
    }));

    // Inventory Health
    const inventoryHealth = inventoryRes?.data || [];

    // Customer Stats
    const customerAcquisition = acquisitionRes?.data || [];
    const activeUsers = activeUsersRes?.data || [];
    const topCustomers = topCustomersRes?.data || [];


    const headerCards = [
        {
            title: "Total Daily Sales",
            value: summary.totalDailySales || 0,
            icon: <Store size={45} className="text-purple-500 bg-purple-50 p-2 rounded-xl" />
        },
        {
            title: "Total Daily Profit",
            value: summary.totalDailyProfit || 0,
            icon: <Users size={45} className="text-green-500 bg-green-50 p-2 rounded-xl" />
        },
        {
            title: "Total Returned Products",
            value: summary.totalReturnedProducts || 0,
            icon: <Boxes size={45} className="text-blue-500 bg-blue-50 p-2 rounded-xl" />
        },
        {
            title: "Total Number of Discounts",
            value: summary.totalDiscounts || 0,
            icon: <CircleX size={45} className="text-red-500 bg-red-50 p-2 rounded-xl" />
        },
    ];

    return (
        <section className="">
            <div className="flex justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Analytics</h1>
                    <h1 className="text-sm text-gray-500">Quick Overview of the company stock</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {headerCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">{card.title}</h2>
                                <p className="text-sm text-gray-500">{card.discription}</p>
                            </div>
                            <div>
                                <span className=""> {card.icon}</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">
                            {loading ? '...' : card.value}
                        </h3>
                    </div>
                ))}
            </div>

            <section className="space-y-6">
                <SalesPerformance
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    salesData={salesPerformance}
                    categoryData={categories}
                    topProductsData={topProducts}
                    stockData={inventoryHealth}
                    profitabilityData={profitabilityData}
                    loading={loading}
                />

                <CustomerReports
                    acquisitionData={customerAcquisition}
                    activeUsersData={activeUsers}
                    topCustomersData={topCustomers}
                    loading={loading}
                />

                <ShopEmployeeReports
                    shopPerformance={shopPerformance}
                    employeePerformance={employeePerformance}
                    loading={loading}
                />
            </section>
        </section>
    );
}

export default AnalyticsPage;
