"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const ShopEmployeeReports = dynamic(() => import('@/components/visuals/reports/ShopEmployeeReports'), {
    loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100" />,
    ssr: false
});

export default function ShopReportsSection({ shopRes, employeeRes, branchesRes, workersRes }) {
    const t = useTranslations('dashboard');

    // Transform Data
    const rawShops = shopRes?.data || shopRes || [];
    const branches = branchesRes?.data || branchesRes || [];

    const shopPerformance = rawShops.map(item => {
        const shop = branches.find(b => (b._id || b.id) === item.shopId);
        return {
            name: shop ? shop.name : `${t('shopLabel')} ${item.shopId?.slice(-4)}`,
            value: parseFloat(item.totalRevenue) || 0
        };
    });

    const rawEmployees = employeeRes?.data || employeeRes || [];
    const workers = workersRes || [];

    const employeePerformance = rawEmployees.map(item => {
        const worker = workers.find(w => (w._id || w.id) === item.employeeId);
        return {
            name: worker ? `${worker.firstName} ${worker.lastName}` : `${t('employeeLabel')} ${item.employeeId?.slice(-4)}`,
            value: parseFloat(item.totalSales) || 0
        };
    });

    return (
        <ShopEmployeeReports
            shopPerformance={shopPerformance}
            employeePerformance={employeePerformance}
            loading={false}
        />
    );
}
