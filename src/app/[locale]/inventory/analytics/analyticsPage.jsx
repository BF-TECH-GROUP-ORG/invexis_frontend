"use client";
import React, { useState } from 'react';
import { Store, Users, Boxes, CircleX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import Skeleton from '@/components/shared/Skeleton';
import SalesPerformance from '@/components/visuals/sales/salesPerformance';
import CustomerReports from '@/components/visuals/reports/CustomerReports';
import ShopEmployeeReports from '@/components/visuals/reports/ShopEmployeeReports';
import AnalyticsService from '@/services/analyticsService';
import { getBranches } from '@/services/branches';
import { getWorkersByCompanyId } from '@/services/workersService';
import dayjs from 'dayjs';

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const { data: session } = useSession();
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

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

    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    // --- Queries ---

    // 1. Dashboard Summary
    const { data: summaryRes, isLoading: summaryLoading } = useQuery({
        queryKey: ['analytics', 'summary', params],
        queryFn: () => AnalyticsService.getDashboardSummary(params, options),
        staleTime: 60 * 1000, // 1 minute
        retry: false,
    });

    // 2. Sales Revenue
    const { data: salesRes, isLoading: salesLoading } = useQuery({
        queryKey: ['analytics', 'sales', params],
        queryFn: () => AnalyticsService.getRevenueReport(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 3. Profitability
    const { data: profitabilityRes, isLoading: profitabilityLoading } = useQuery({
        queryKey: ['analytics', 'profitability', params],
        queryFn: () => AnalyticsService.getProfitabilityReport(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 4. Top Products
    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: ['analytics', 'products', params],
        queryFn: () => AnalyticsService.getTopProducts(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 5. Inventory Health
    const { data: inventoryRes, isLoading: inventoryLoading } = useQuery({
        queryKey: ['analytics', 'inventory', params],
        queryFn: () => AnalyticsService.getInventoryHealth(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 6. Payment Methods (Categories)
    const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
        queryKey: ['analytics', 'paymentMethods', params],
        queryFn: () => AnalyticsService.getPaymentMethodStats(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 7. Customer Stats
    const { data: acquisitionRes, isLoading: acquisitionLoading } = useQuery({
        queryKey: ['analytics', 'acquisition', params],
        queryFn: () => AnalyticsService.getNewCustomerStats(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const { data: activeUsersRes, isLoading: activeUsersLoading } = useQuery({
        queryKey: ['analytics', 'activeUsers', params],
        queryFn: () => AnalyticsService.getActiveUsers(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const { data: topCustomersRes, isLoading: topCustomersLoading } = useQuery({
        queryKey: ['analytics', 'topCustomers', params],
        queryFn: () => AnalyticsService.getTopCustomers(params, options),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 8. Shop & Employee Performance
    const { data: shopRes, isLoading: shopLoading } = useQuery({
        queryKey: ['analytics', 'shops', params],
        queryFn: () => AnalyticsService.getShopPerformance(params, options),
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: false,
    });

    const { data: employeeRes, isLoading: employeeLoading } = useQuery({
        queryKey: ['analytics', 'employees', params],
        queryFn: () => AnalyticsService.getEmployeePerformance(params, options),
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: false,
    });

    // Fetch Shops and Workers for name mapping
    const { data: branchesRes } = useQuery({
        queryKey: ['branches', companyId],
        queryFn: () => getBranches(companyId, options),
        enabled: !!companyId,
    });

    const { data: workersRes } = useQuery({
        queryKey: ['workers', companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
        enabled: !!companyId,
    });

    const loading = summaryLoading || salesLoading || profitabilityLoading || productsLoading || inventoryLoading || categoriesLoading || acquisitionLoading || activeUsersLoading || topCustomersLoading || shopLoading || employeeLoading;

    // --- Data Transformation ---

    // Summary Data
    const summary = summaryRes?.data || summaryRes || {};
    console.log('📊 Summary Response:', summaryRes);
    console.log('📊 Summary Data:', summary);

    // Sales Performance
    const rawSales = salesRes?.data || salesRes || [];
    console.log('💰 Sales Response:', salesRes);
    console.log('💰 Raw Sales:', rawSales);

    const salesPerformance = rawSales.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        current: parseFloat(item.revenue) || 0,
        previous: 0
    }));
    console.log('💰 Sales Performance (transformed):', salesPerformance);

    // Profitability
    // API: [{"date":"...","revenue":"98.00","cost":"9.00","profit":"89.00","grossMarginPercent":"..."}]
    const rawProfitability = profitabilityRes?.data || profitabilityRes || [];
    console.log('📈 Profitability Response:', profitabilityRes);
    console.log('📈 Raw Profitability:', rawProfitability);

    const profitabilityData = rawProfitability.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        revenue: parseFloat(item.revenue) || 0,
        cost: parseFloat(item.cost) || 0,
        profit: parseFloat(item.profit) || 0,
        margin: parseFloat(item.grossMarginPercent) || 0
    }));
    console.log('📈 Profitability Data (transformed):', profitabilityData);

    // Top Products
    const rawProducts = productsRes?.data || productsRes || [];
    console.log('🏆 Products Response:', productsRes);
    console.log('🏆 Raw Products:', rawProducts);

    const topProducts = rawProducts.map(item => ({
        name: item.productName || 'Unknown',
        quantity: parseInt(item.totalQuantity) || 0
    }));
    console.log('🏆 Top Products (transformed):', topProducts);

    // Payment Methods
    const rawCategories = categoriesRes?.data || categoriesRes || [];
    console.log('💳 Categories Response:', categoriesRes);
    console.log('💳 Raw Categories:', rawCategories);

    const categories = rawCategories.map(item => ({
        name: item.method || 'Unknown',
        value: parseInt(item.count) || 0
    }));
    console.log('💳 Categories (transformed):', categories);

    // Shop Performance
    const rawShops = shopRes?.data || shopRes || [];
    const branches = branchesRes?.data || branchesRes || [];
    const shopPerformance = rawShops.map(item => {
        const shop = branches.find(b => (b._id || b.id) === item.shopId);
        return {
            name: shop ? shop.name : `Shop ${item.shopId?.slice(-4)}`,
            value: parseFloat(item.totalRevenue) || 0
        };
    });

    // Employee Performance
    const rawEmployees = employeeRes?.data || employeeRes || [];
    const workers = workersRes || [];
    const employeePerformance = rawEmployees.map(item => {
        const worker = workers.find(w => (w._id || w.id) === item.employeeId);
        return {
            name: worker ? `${worker.firstName} ${worker.lastName}` : `Emp ${item.employeeId?.slice(-4)}`,
            value: parseFloat(item.totalSales) || 0
        };
    });

    // Inventory Health
    const inventoryHealth = inventoryRes?.data || inventoryRes || [];
    console.log('📦 Inventory Health:', inventoryHealth);

    // Customer Stats
    const customerAcquisition = acquisitionRes?.data || acquisitionRes || [];
    const activeUsers = activeUsersRes?.data || activeUsersRes || [];
    const topCustomers = topCustomersRes?.data || topCustomersRes || [];


    const headerCards = [
        {
            title: "Total Daily Sales",
            value: summary.totalDailySales || 0,
            icon: <Store size={45} className="text-purple-500 bg-purple-50 p-3 rounded-xl" />
        },
        {
            title: "Total Daily Profit",
            value: summary.totalDailyProfit || 0,
            icon: <Users size={45} className="text-green-500 bg-green-50 p-3 rounded-xl" />
        },
        {
            title: "Total Returned Products",
            value: summary.totalReturnedProducts || 0,
            icon: <Boxes size={45} className="text-blue-500 bg-blue-50 p-3 rounded-xl" />
        },
        {
            title: "Total Number of Discounts",
            value: summary.totalDiscounts || 0,
            icon: <CircleX size={45} className="text-red-500 bg-red-50 p-3 rounded-xl" />
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
                                <h2 className="text-gray-500 text-sm">{card.title}</h2>
                                <p className="text-sm text-gray-500">{card.discription}</p>
                            </div>
                            <div>
                                <span className=""> {card.icon}</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">
                            {loading ? (
                                <Skeleton className="h-8 w-24 mt-1" />
                            ) : (
                                card.value
                            )}
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

                {/* <CustomerReports
                    acquisitionData={customerAcquisition}
                    activeUsersData={activeUsers}
                    topCustomersData={topCustomers}
                    loading={loading}
                />  */}

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
