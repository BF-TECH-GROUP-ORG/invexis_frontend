"use client";
import React, { useState, useTransition, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

const SalesPerformance = dynamic(() => import('@/components/visuals/sales/salesPerformance'), {
    loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100" />,
    ssr: false
});

export default function SalesChartsSection({
    salesRes,
    categoriesRes,
    productsRes,
    movementRes,
    profitabilityRes,
    timeRange,
    selectedDate
}) {
    const [isPending, startTransition] = useTransition();
    const [optimisticTimeRange, setOptimisticTimeRange] = useState(timeRange);

    // Sync optimistic state with actual value when server data arrives
    useEffect(() => {
        setOptimisticTimeRange(timeRange);
    }, [timeRange]);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleUpdateParam = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const setTimeRange = (range) => {
        setOptimisticTimeRange(range);
        handleUpdateParam('timeRange', range);
    };
    
    const setSelectedDate = (date) => handleUpdateParam('date', date ? dayjs(date).format('YYYY-MM-DD') : '');

    // Transform Data
    const rawSales = salesRes?.data || salesRes || [];
    const salesPerformance = rawSales.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        date: item.date,
        current: parseFloat(item.revenue) || 0,
        previous: 0
    }));

    const rawCategories = categoriesRes?.data || categoriesRes || [];
    const categories = rawCategories.map(item => ({
        name: item.method || 'Unknown',
        value: parseInt(item.count) || 0
    }));

    const rawProducts = productsRes?.data || productsRes || [];
    const topProducts = rawProducts.map(item => ({
        name: item.productName || 'Unknown',
        quantity: parseInt(item.totalQuantity) || 0
    }));

    const rawMovement = movementRes?.data || movementRes || [];
    const stockMovement = rawMovement.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        in: parseFloat(item.stockIn) || 0,
        out: parseFloat(item.stockOut) || 0,
        net: parseFloat(item.netFlow) || 0
    }));

    const rawProfitability = profitabilityRes?.data || profitabilityRes || [];
    const profitabilityData = rawProfitability.map(item => ({
        name: dayjs(item.date).format('DD/MM'),
        date: item.date,
        revenue: parseFloat(item.revenue) || 0,
        cost: parseFloat(item.cost) || 0,
        profit: parseFloat(item.profit) || 0,
        margin: parseFloat(item.grossMarginPercent) || 0
    }));

    return (
        <SalesPerformance
            timeRange={optimisticTimeRange}
            setTimeRange={setTimeRange}
            selectedDate={dayjs(selectedDate)}
            setSelectedDate={setSelectedDate}
            salesData={salesPerformance}
            categoryData={categories}
            topProductsData={topProducts}
            stockData={stockMovement}
            profitabilityData={profitabilityData}
            loading={isPending}
        />
    );
}
