"use client";

import { DollarSign, TrendingUp, Calculator, CreditCard } from "lucide-react";
import { useMemo } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useLocale } from "next-intl";

// Analytics theme colors matching pie chart
const THEME_COLORS = {
    darkNavy: { color: "#081422", bgColor: "#f1f5f9" },
    orange: { color: "#ea580c", bgColor: "#fff7ed" },
    lightOrange: { color: "#fb923c", bgColor: "#ffedd5" },
    gray: { color: "#94a3b8", bgColor: "#f8fafc" },
    lightGray: { color: "#cbd5e1", bgColor: "#f1f5f9" },
    indigo: { color: "#6366f1", bgColor: "#eef2ff" },
    green: { color: "#10b981", bgColor: "#ecfdf5" },
};

const PaymentCards = ({ payments = [], isLoading = false }) => {
    const locale = useLocale();

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toDateString();
        }).reverse();

        const paymentsArray = Array.isArray(payments) ? payments : [];

        // Only count succeeded/completed payments
        const successfulPayments = paymentsArray.filter(
            p => p.status === 'succeeded' || p.status === 'completed'
        );

        const getDailyStats = (dateStr) => {
            const dayPayments = successfulPayments.filter(
                payment => new Date(payment.created_at || payment.date).toDateString() === dateStr
            );

            const totalRevenue = dayPayments.reduce(
                (sum, payment) => sum + (parseFloat(payment.amount) || 0),
                0
            );

            const transactionCount = dayPayments.length;

            // Count payment methods for this day
            const methodCounts = {};
            dayPayments.forEach(p => {
                const method = p.method || p.paymentMethod || 'Unknown';
                methodCounts[method] = (methodCounts[method] || 0) + 1;
            });

            return { totalRevenue, transactionCount, methodCounts };
        };

        const history = last7Days.map(dateStr => ({
            date: dateStr,
            ...getDailyStats(dateStr)
        }));

        const todayStats = history[history.length - 1];
        const yesterdayStats = history[history.length - 2] || {
            totalRevenue: 0,
            transactionCount: 0,
            methodCounts: {}
        };

        const calculateTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        // Calculate overall stats
        const totalRevenue = successfulPayments.reduce(
            (sum, p) => sum + (parseFloat(p.amount) || 0),
            0
        );
        const totalTransactions = successfulPayments.length;
        const averageTransactionValue = totalTransactions > 0
            ? totalRevenue / totalTransactions
            : 0;

        // Find most used payment method
        const allMethodCounts = {};
        successfulPayments.forEach(p => {
            const method = p.method || p.paymentMethod || 'Unknown';
            allMethodCounts[method] = (allMethodCounts[method] || 0) + 1;
        });

        const sortedMethods = Object.entries(allMethodCounts).sort((a, b) => b[1] - a[1]);

        // Format method name for display
        const formatMethodName = (method) => {
            if (!method || method === 'N/A') return 'N/A';
            const methodMap = {
                'cash': 'Cash',
                'momo': 'Mobile Money',
                'card': 'Card',
                'bank': 'Bank Transfer',
                'mobile_money': 'Mobile Money',
                'credit_card': 'Credit Card',
                'debit_card': 'Debit Card'
            };
            return methodMap[method.toLowerCase()] || method.charAt(0).toUpperCase() + method.slice(1);
        };

        const mostUsedMethod = sortedMethods[0] ? formatMethodName(sortedMethods[0][0]) : 'N/A';
        const mostUsedMethodPercentage = sortedMethods[0] && totalTransactions > 0
            ? (sortedMethods[0][1] / totalTransactions) * 100
            : 0;

        return {
            totalRevenue,
            totalTransactions,
            averageTransactionValue,
            mostUsedMethod,
            mostUsedMethodPercentage,
            today: todayStats,
            history,
            trends: {
                revenue: calculateTrend(todayStats.totalRevenue, yesterdayStats.totalRevenue),
                transactions: calculateTrend(todayStats.transactionCount, yesterdayStats.transactionCount),
            }
        };
    }, [payments]);

    const cards = [
        {
            title: "Total Revenue",
            value: stats.totalRevenue,
            trend: stats.trends.revenue,
            history: [],
            Icon: DollarSign,
            color: THEME_COLORS.orange.color,
            bgColor: THEME_COLORS.orange.bgColor,
            key: "revenue",
            isCurrency: true,
        },
        {
            title: "Total Transactions",
            value: stats.totalTransactions,
            trend: stats.trends.transactions,
            history: [],
            Icon: TrendingUp,
            color: THEME_COLORS.darkNavy.color,
            bgColor: THEME_COLORS.darkNavy.bgColor,
            key: "transactions",
            isCurrency: false,
        },
        {
            title: "Average Transaction",
            value: stats.averageTransactionValue,
            trend: 0, // No trend for average
            history: [],
            Icon: Calculator,
            color: THEME_COLORS.indigo.color,
            bgColor: THEME_COLORS.indigo.bgColor,
            key: "average",
            isCurrency: true,
        },
        {
            title: "Most Used Method",
            value: stats.mostUsedMethod,
            trend: stats.mostUsedMethodPercentage,
            history: [],
            Icon: CreditCard,
            color: THEME_COLORS.green.color,
            bgColor: THEME_COLORS.green.bgColor,
            key: "method",
            isCurrency: false,
            isText: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                    <StatsCard key={i} isLoading={true} />
                ))
            ) : (
                cards.map((card, index) => (
                    <StatsCard
                        key={card.key}
                        title={card.title}
                        value={card.isText ? card.value : card.value}
                        trend={card.trend}
                        history={card.history}
                        icon={card.Icon}
                        color={card.color}
                        bgColor={card.bgColor}
                        isCurrency={card.isCurrency}
                        isText={card.isText}
                        index={index}
                        locale={locale}
                    />
                ))
            )}
        </div>
    );
};

export default PaymentCards;