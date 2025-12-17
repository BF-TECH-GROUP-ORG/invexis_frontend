"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AnalyticsService from "@/services/analyticsService";
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const KPICard = ({ title, value, trend, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </motion.div>
);

export default function DashboardOverview() {
    const t = useTranslations("analytics"); // Assuming we'll add translations later
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // Mocking data for now until backend endpoint is fully ready or using the service if available
                // const data = await AnalyticsService.getDashboardSummary();
                // setSummary(data);

                // Temporary mock to visualize the UI
                setSummary({
                    totalCompanies: 150,
                    totalShops: 450,
                    totalRevenue: 1250000,
                    companiesTrend: 12,
                    shopsTrend: 5,
                    revenueTrend: 8
                });
            } catch (error) {
                console.error("Failed to fetch dashboard summary", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KPICard
                        title="Total Companies"
                        value={summary?.totalCompanies}
                        trend={summary?.companiesTrend}
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <KPICard
                        title="Total Shops"
                        value={summary?.totalShops}
                        trend={summary?.shopsTrend}
                        icon={ShoppingBag}
                        color="bg-purple-500"
                    />
                    <KPICard
                        title="Total Revenue"
                        value={`$${summary?.totalRevenue?.toLocaleString()}`}
                        trend={summary?.revenueTrend}
                        icon={DollarSign}
                        color="bg-green-500"
                    />
                </div>

                {/* Placeholder for future charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">
                        Revenue Trend Chart Placeholder
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">
                        Active Companies Chart Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}
