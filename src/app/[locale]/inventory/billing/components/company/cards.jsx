'use client';

import { useMemo } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { useLocale, useTranslations } from 'next-intl';
import { Coins, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const CompanyPaymentCards = ({ payments = [], isLoading = false }) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    const paymentsArray = Array.isArray(payments) ? payments : [];

    const getDailyStats = (dateStr) => {
      const dayPayments = paymentsArray.filter(payment => 
        new Date(payment.created_at).toDateString() === dateStr
      );
      
      const totalAmount = dayPayments.reduce((sum, payment) => 
        sum + (parseFloat(payment.amount) || 0), 0
      );

      const succeededCount = dayPayments.filter(payment => 
        payment.status === 'succeeded'
      ).length;

      const pendingCount = dayPayments.filter(payment => 
        payment.status === 'pending'
      ).length;

      const failedCount = dayPayments.filter(payment => 
        payment.status === 'failed'
      ).length;

      return { totalAmount, succeededCount, pendingCount, failedCount };
    };

    const history = last7Days.map(dateStr => ({
      date: dateStr,
      ...getDailyStats(dateStr)
    }));

    const todayStats = history[history.length - 1];
    const yesterdayStats = history[history.length - 2] || { 
      totalAmount: 0, 
      succeededCount: 0, 
      pendingCount: 0, 
      failedCount: 0 
    };

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Calculate total stats
    const totalAmount = paymentsArray.reduce((sum, payment) => 
      sum + (parseFloat(payment.amount) || 0), 0
    );

    const totalSucceeded = paymentsArray.filter(p => p.status === 'succeeded').length;
    const totalPending = paymentsArray.filter(p => p.status === 'pending').length;

    return {
      today: todayStats,
      history,
      totalAmount,
      totalSucceeded,
      totalPending,
      trends: {
        amount: calculateTrend(todayStats.totalAmount, yesterdayStats.totalAmount),
        succeeded: calculateTrend(todayStats.succeededCount, yesterdayStats.succeededCount),
        pending: calculateTrend(todayStats.pendingCount, yesterdayStats.pendingCount),
      }
    };
  }, [payments]);

  const locale = useLocale();
  const t = useTranslations('payments.cards');

  const cards = [
    {
      title: t('totalPaymentAmount') || 'Total Payment Amount',
      value: stats.today.totalAmount,
      trend: stats.trends.amount,
      history: stats.history.map(h => ({ value: h.totalAmount, name: h.date })),
      Icon: Coins,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      key: 'amount',
      isCurrency: true,
    },
    {
      title: t('succeededPayments') || 'Successful Payments',
      value: stats.today.succeededCount,
      trend: stats.trends.succeeded,
      history: stats.history.map(h => ({ value: h.succeededCount, name: h.date })),
      Icon: CheckCircle,
      color: '#10b981',
      bgColor: '#ecfdf5',
      key: 'succeeded',
      isCurrency: false,
    },
    {
      title: t('pendingPayments') || 'Pending Payments',
      value: stats.today.pendingCount,
      trend: stats.trends.pending,
      history: stats.history.map(h => ({ value: h.pendingCount, name: h.date })),
      Icon: Clock,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      key: 'pending',
      isCurrency: false,
    },
    {
      title: t('totalTransactions') || 'Total Transactions',
      value: stats.today.succeededCount + stats.today.pendingCount + stats.today.failedCount,
      trend: 0,
      history: stats.history.map(h => ({ 
        value: h.succeededCount + h.pendingCount + h.failedCount, 
        name: h.date 
      })),
      Icon: TrendingUp,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      key: 'transactions',
      isCurrency: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
      {isLoading ? (
        [1, 2, 3, 4].map((i) => (
          <StatsCard key={i} isLoading={true} />
        ))
      ) : (
        cards.map((card, index) => (
          <StatsCard
            key={card.key}
            title={card.title}
            value={card.value}
            trend={card.trend}
            history={card.history}
            icon={card.Icon}
            color={card.color}
            bgColor={card.bgColor}
            isCurrency={card.isCurrency}
            index={index}
            locale={locale}
          />
        ))
      )}
    </div>
  );
};

export default CompanyPaymentCards;
