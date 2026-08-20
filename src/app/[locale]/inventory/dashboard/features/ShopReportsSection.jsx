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
    const workers = workersRes?.data || workersRes || [];

    const getEmployeeName = (item, worker) => {
        if (worker?.firstName || worker?.lastName) return `${worker.firstName || ''} ${worker.lastName || ''}`.trim();
        if (worker?.name) return worker.name;
        if (worker?.username) return worker.username;
        if (item?.employeeName) return item.employeeName;
        if (item?.name) return item.name;
        if (item?.user?.firstName || item?.user?.lastName) return `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim();
        if (item?.user?.username) return item.user.username;
        if (item?.firstName || item?.lastName) return `${item.firstName || ''} ${item.lastName || ''}`.trim();
        if (item?.username) return item.username;
        return `${t('employeeLabel')} ${item.employeeId?.slice(-4) || ''}`.trim();
    };

    const employeePerformance = rawEmployees
        .filter(item => {
            const empId = String(item.employeeId || item._id || item.id || item.userId || '');
            const worker = workers.find(w => 
                String(w._id || w.id || '') === empId || 
                String(w.userId || w.user?._id || '') === empId
            );
            const role = worker?.role || item.role || item.user?.role;
            return role !== 'company_admin';
        })
        .map(item => {
            const empId = String(item.employeeId || item._id || item.id || item.userId || '');
            const worker = workers.find(w => 
                String(w._id || w.id || '') === empId || 
                String(w.userId || w.user?._id || '') === empId
            );
            return {
                name: getEmployeeName(item, worker),
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
