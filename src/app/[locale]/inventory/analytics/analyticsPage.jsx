"use client";
import React, { useState } from 'react';
import { Store, Boxes, TrendingUp, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { StatsCard } from '@/components/shared/StatsCard';
// import Skeleton from '@/components/shared/Skeleton';
import dynamic from 'next/dynamic';
const SalesPerformance = dynamic(() => import('@/components/visuals/sales/salesPerformance'), {
    loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100" />,
    ssr: false
});
const ShopEmployeeReports = dynamic(() => import('@/components/visuals/reports/ShopEmployeeReports'), {
    loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100" />,
    ssr: false
});
import AnalyticsService from '@/services/analyticsService';
import { getBranches } from '@/services/branches';
import { getWorkersByCompanyId } from '@/services/workersService';
import dayjs from 'dayjs';

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const locale = useLocale();
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
        staleTime: 10 * 60 * 1000, // 10 minutes persistence
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 2. Sales Revenue
    const { data: salesRes, isLoading: salesLoading } = useQuery({
        queryKey: ['analytics', 'sales', params],
        queryFn: () => AnalyticsService.getRevenueReport(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 3. Profitability
    const { data: profitabilityRes, isLoading: profitabilityLoading } = useQuery({
        queryKey: ['analytics', 'profitability', params],
        queryFn: () => AnalyticsService.getProfitabilityReport(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 4. Top Products
    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: ['analytics', 'products', params],
        queryFn: () => AnalyticsService.getTopProducts(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 5. Inventory Health
    const { data: inventoryRes, isLoading: inventoryLoading } = useQuery({
        queryKey: ['analytics', 'inventory', params],
        queryFn: () => AnalyticsService.getInventoryHealth(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    const { data: movementRes, isLoading: movementLoading } = useQuery({
        queryKey: ['analytics', 'movement', params],
        queryFn: () => AnalyticsService.getStockMovement(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 6. Payment Methods (Categories)
    const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
        queryKey: ['analytics', 'paymentMethods', params],
        queryFn: () => AnalyticsService.getPaymentMethodStats(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 7. Customer Stats
    const { data: acquisitionRes, isLoading: acquisitionLoading } = useQuery({
        queryKey: ['analytics', 'acquisition', params],
        queryFn: () => AnalyticsService.getNewCustomerStats(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    const { data: activeUsersRes, isLoading: activeUsersLoading } = useQuery({
        queryKey: ['analytics', 'activeUsers', params],
        queryFn: () => AnalyticsService.getActiveUsers(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    const { data: topCustomersRes, isLoading: topCustomersLoading } = useQuery({
        queryKey: ['analytics', 'topCustomers', params],
        queryFn: () => AnalyticsService.getTopCustomers(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    // 8. Shop & Employee Performance
    const { data: shopRes, isLoading: shopLoading } = useQuery({
        queryKey: ['analytics', 'shops', params],
        queryFn: () => AnalyticsService.getShopPerformance(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
    });

    const { data: employeeRes, isLoading: employeeLoading } = useQuery({
        queryKey: ['analytics', 'employees', params],
        queryFn: () => AnalyticsService.getEmployeePerformance(params, options),
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 2,
        enabled: !!session?.accessToken,
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

    const loading = summaryLoading || salesLoading || profitabilityLoading || productsLoading || inventoryLoading || movementLoading || categoriesLoading || acquisitionLoading || activeUsersLoading || topCustomersLoading || shopLoading || employeeLoading;

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
        date: item.date,
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
        date: item.date,
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

    // Inventory Movement (Real data for the chart)
    const rawMovement = movementRes?.data || movementRes || [];
    const stockMovement = rawMovement.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        in: parseFloat(item.stockIn) || 0,
        out: parseFloat(item.stockOut) || 0,
        net: parseFloat(item.netFlow) || 0
    }));

    const headerCards = [
        {
            title: "Total Sales",
            value: parseFloat(summary.totalDailySales) || 0,
            icon: Coins,
            color: "#8b5cf6",
            bgColor: "#f3e8ff",
            isCurrency: true,
            history: salesPerformance.map(s => ({ value: s.current, name: s.date }))
        },
        {
            title: "Total Profit",
            value: parseFloat(summary.totalDailyProfit) || 0,
            icon: TrendingUp,
            color: "#10b981",
            bgColor: "#ecfdf5",
            isCurrency: true,
            history: profitabilityData.map(p => ({ value: p.profit, name: p.date }))
        },
        {
            title: "Total Orders",
            value: parseInt(summary.totalOrders) || 0,
            icon: Store,
            color: "#ea580c",
            bgColor: "#fff7ed",
            history: rawSales.map(s => ({ value: parseInt(s.orderCount) || 0, name: s.date }))
        },
        {
            title: "Top Product",
            value: topProducts.length > 0 ? topProducts[0].quantity : 0,
            icon: Boxes,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            history: topProducts.slice(0, 5).map(p => ({ value: p.quantity, name: p.name }))
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
                    <StatsCard
                        key={index}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        color={card.color}
                        bgColor={card.bgColor}
                        isCurrency={card.isCurrency}
                        history={card.history}
                        isLoading={loading}
                        index={index}
                        locale={locale}
                    />
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
                    stockData={stockMovement}
                    profitabilityData={profitabilityData}
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
