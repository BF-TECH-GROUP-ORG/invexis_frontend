"use client";
import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import SalesPerformance from '@/components/visuals/sales/salesPerformance';
import ShopEmployeeReports from '@/components/visuals/reports/ShopEmployeeReports';
import AnalyticsService from '@/services/analyticsService';
import { getBranches } from '@/services/branches';
import { getWorkersByCompanyId } from '@/services/workersService';
import dayjs from 'dayjs';

const SalesReportsPage = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const { data: session } = useSession();
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

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
                interval = 'day';
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
        staleTime: 60 * 1000,
        retry: false,
    });

    // 2. Sales Revenue
    const { data: salesRes, isLoading: salesLoading } = useQuery({
        queryKey: ['analytics', 'sales', params],
        queryFn: () => AnalyticsService.getRevenueReport(params),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 3. Profitability
    const { data: profitabilityRes, isLoading: profitabilityLoading } = useQuery({
        queryKey: ['analytics', 'profitability', params],
        queryFn: () => AnalyticsService.getProfitabilityReport(params),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 4. Top Products
    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: ['analytics', 'products', params],
        queryFn: () => AnalyticsService.getTopProducts(params),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 5. Payment Methods
    const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
        queryKey: ['analytics', 'paymentMethods', params],
        queryFn: () => AnalyticsService.getPaymentMethodStats(params),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 6. Shop & Employee Performance
    const { data: shopRes, isLoading: shopLoading } = useQuery({
        queryKey: ['analytics', 'shops', params],
        queryFn: () => AnalyticsService.getShopPerformance(params),
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    const { data: employeeRes, isLoading: employeeLoading } = useQuery({
        queryKey: ['analytics', 'employees', params],
        queryFn: () => AnalyticsService.getEmployeePerformance(params),
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    // Fetch Shops and Workers for name mapping
    const { data: branchesRes } = useQuery({
        queryKey: ['branches', companyId],
        queryFn: () => getBranches(companyId),
        enabled: !!companyId,
    });

    const { data: workersRes } = useQuery({
        queryKey: ['workers', companyId],
        queryFn: () => getWorkersByCompanyId(companyId),
        enabled: !!companyId,
    });

    const loading = summaryLoading || salesLoading || profitabilityLoading || productsLoading || categoriesLoading || shopLoading || employeeLoading;

    // --- Data Transformation ---

    const summary = summaryRes?.data || summaryRes || {};

    const rawSales = salesRes?.data || salesRes || [];
    const salesPerformance = rawSales.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        current: parseFloat(item.revenue) || 0,
        previous: 0
    }));

    const rawProfitability = profitabilityRes?.data || profitabilityRes || [];
    const profitabilityData = rawProfitability.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        revenue: parseFloat(item.revenue) || 0,
        cost: parseFloat(item.cost) || 0,
        profit: parseFloat(item.profit) || 0,
        margin: parseFloat(item.grossMarginPercent) || 0
    }));

    const rawProducts = productsRes?.data || productsRes || [];
    const topProducts = rawProducts.map(item => ({
        name: item.productName || 'Unknown',
        quantity: parseInt(item.totalQuantity) || 0
    }));

    const rawCategories = categoriesRes?.data || categoriesRes || [];
    const categories = rawCategories.map(item => ({
        name: item.method || 'Unknown',
        value: parseInt(item.count) || 0
    }));

    const rawShops = shopRes?.data || shopRes || [];
    const branches = branchesRes?.data || branchesRes || [];
    const shopPerformance = rawShops.map(item => {
        const shop = branches.find(b => (b._id || b.id) === item.shopId);
        return {
            name: shop ? shop.name : `Shop ${item.shopId?.slice(-4)}`,
            value: parseFloat(item.totalRevenue) || 0
        };
    });

    const rawEmployees = employeeRes?.data || employeeRes || [];
    const workers = workersRes || [];
    const employeePerformance = rawEmployees.map(item => {
        const worker = workers.find(w => (w._id || w.id) === item.employeeId);
        return {
            name: worker ? `${worker.firstName} ${worker.lastName}` : `Emp ${item.employeeId?.slice(-4)}`,
            value: parseFloat(item.totalSales) || 0
        };
    });

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
                    {headerCards.map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Performance Charts */}
                <SalesPerformance
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
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

export default SalesReportsPage;
