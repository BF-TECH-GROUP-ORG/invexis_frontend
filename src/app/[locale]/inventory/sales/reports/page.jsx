import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SalesReportsClient from './SalesReportsClient';
import AnalyticsService from '@/services/analyticsService';
import { getBranches } from '@/services/branches';
import { getWorkersByCompanyId } from '@/services/workersService';
import dayjs from 'dayjs';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

const SalesReportsPage = async ({ searchParams }) => {
    const session = await getServerSession(authOptions);

    // Await searchParams if it's a promise (Next.js 15 behavior)
    const resolvedParams = await (searchParams || {});
    const timeRange = resolvedParams.timeRange || '7d';
    const customDate = resolvedParams.date || dayjs().format('YYYY-MM-DD');

    if (!session?.accessToken) {
        return <div>Please log in to view sales reports.</div>;
    }

    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    };

    // Calculate dates on the server
    const end = dayjs(customDate);
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

    const params = {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        interval
    };

    // Helper for server-side persistence using unstable_cache
    const getCachedAnalytics = (key, fetcher) =>
        unstable_cache(
            async () => fetcher(),
            [`reports-${key}`, companyId, JSON.stringify(params)],
            { revalidate: 300, tags: ['analytics', `company-${companyId}`] }
        )();

    // Fetch all required data in parallel on the server
    const [
        summaryRes,
        salesRes,
        profitabilityRes,
        productsRes,
        categoriesRes,
        shopRes,
        employeeRes,
        branchesRes,
        workersRes
    ] = await Promise.all([
        getCachedAnalytics('summary', () => AnalyticsService.getDashboardSummary(params, options)),
        getCachedAnalytics('sales', () => AnalyticsService.getRevenueReport(params, options)),
        getCachedAnalytics('profitability', () => AnalyticsService.getProfitabilityReport(params, options)),
        getCachedAnalytics('products', () => AnalyticsService.getTopProducts(params, options)),
        getCachedAnalytics('categories', () => AnalyticsService.getPaymentMethodStats(params, options)),
        getCachedAnalytics('shops', () => AnalyticsService.getShopPerformance(params, options)),
        getCachedAnalytics('employees', () => AnalyticsService.getEmployeePerformance(params, options)),
        unstable_cache(
            async () => getBranches(companyId, options),
            [`shops`, companyId],
            { revalidate: 600, tags: ['shops', `company-${companyId}`] }
        )(),
        unstable_cache(
            async () => getWorkersByCompanyId(companyId, options),
            [`workers`, companyId],
            { revalidate: 600, tags: ['workers', `company-${companyId}`] }
        )()
    ]);

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

    const initialData = {
        summary,
        salesPerformance,
        profitabilityData,
        topProducts,
        categories,
        shopPerformance,
        employeePerformance,
        timeRange,
        selectedDate: customDate
    };

    return <SalesReportsClient initialData={initialData} />;
};

export default SalesReportsPage;
