/**
 * Sample Payment Data for Development
 * This file contains realistic payment history data for testing and development
 */

export const PAYMENT_METHODS = {
    MTN: 'MTN Mobile Money',
    AIRTEL: 'Airtel Money',
    MPESA: 'M-Pesa',
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank Transfer',
    STRIPE: 'Stripe',
};

export const PAYMENT_STATUS = {
    COMPLETED: 'completed',
    PENDING: 'pending',
    FAILED: 'failed',
    PROCESSING: 'processing',
};

export const SHOPS = [
    { id: 'shop_001', name: 'Main Branch - Kigali' },
    { id: 'shop_002', name: 'Downtown Store' },
    { id: 'shop_003', name: 'Airport Branch' },
    { id: 'shop_004', name: 'Kimironko Market' },
    { id: 'shop_005', name: 'Nyabugogo Branch' },
];

// Generate realistic payment data
const generatePaymentData = () => {
    const payments = [];
    const startDate = new Date('2023-10-01');
    const endDate = new Date('2026-01-23');

    const payerNames = [
        'Jean Baptiste Uwimana',
        'Marie Claire Mukamana',
        'Eric Niyonzima',
        'Grace Uwase',
        'Patrick Habimana',
        'Sarah Ingabire',
        'David Mugisha',
        'Alice Nyiramana',
        'Joseph Nkurunziza',
        'Christine Mukamazimpaka',
        'Emmanuel Ndayisaba',
        'Diane Umutoni',
        'Frank Bizimana',
        'Rose Uwera',
        'Charles Nsengimana',
        'Josephine Mukandori',
        'Robert Kayitare',
        'Agnes Nyirahabimana',
        'Samuel Hakizimana',
        'Beatrice Mukasine',
    ];

    const paymentMethodsArray = Object.keys(PAYMENT_METHODS);
    const statusArray = Object.values(PAYMENT_STATUS);

    // Generate 60 payment records
    for (let i = 0; i < 60; i++) {
        const randomDate = new Date(
            startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
        );

        const paymentMethod = paymentMethodsArray[Math.floor(Math.random() * paymentMethodsArray.length)];
        const shop = SHOPS[Math.floor(Math.random() * SHOPS.length)];
        const payer = payerNames[Math.floor(Math.random() * payerNames.length)];

        // Generate realistic amounts based on payment method
        let amount;
        if (paymentMethod === 'CASH') {
            amount = Math.floor(Math.random() * 50000) + 5000; // 5k - 55k
        } else if (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'STRIPE') {
            amount = Math.floor(Math.random() * 500000) + 50000; // 50k - 550k
        } else {
            amount = Math.floor(Math.random() * 200000) + 10000; // 10k - 210k
        }

        // Most payments should be completed
        let status;
        const statusRand = Math.random();
        if (statusRand < 0.75) {
            status = PAYMENT_STATUS.COMPLETED;
        } else if (statusRand < 0.85) {
            status = PAYMENT_STATUS.PENDING;
        } else if (statusRand < 0.95) {
            status = PAYMENT_STATUS.PROCESSING;
        } else {
            status = PAYMENT_STATUS.FAILED;
        }

        const transactionId = `TXN${randomDate.getFullYear()}${String(randomDate.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`;
        const reference = `REF-${paymentMethod}-${Date.now()}-${i}`;

        // Generate phone number for mobile money
        const phoneNumber = paymentMethod === 'MTN' || paymentMethod === 'AIRTEL' || paymentMethod === 'MPESA'
            ? `+25078${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`
            : null;

        payments.push({
            transactionId,
            paymentMethod: PAYMENT_METHODS[paymentMethod],
            paymentMethodCode: paymentMethod,
            date: randomDate.toISOString(),
            amount,
            currency: 'RWF',
            shop: shop.name,
            shopId: shop.id,
            payer: payer,
            payerPhone: phoneNumber,
            status,
            reference,
            createdAt: randomDate.toISOString(),
            updatedAt: randomDate.toISOString(),
        });
    }

    // Sort by date descending (most recent first)
    return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const samplePaymentData = generatePaymentData();

// Calculate statistics
export const calculatePaymentStats = (payments = []) => {
    if (!payments || payments.length === 0) {
        return {
            totalRevenue: 0,
            totalTransactions: 0,
            averageTransactionValue: 0,
            mostUsedMethod: 'N/A',
            mostUsedMethodPercentage: 0,
            revenueTrend: 0,
            transactionsTrend: 0,
            avgTrend: 0,
            last7DaysHistory: [],
            methodDistribution: [],
        };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Normalize status for comparisons
    const isCompleted = (status) => status === 'completed' || status === 'succeeded';

    // Dates for trends
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last14Days = new Date(today);
    last14Days.setDate(last14Days.getDate() - 14);

    // Filter payments
    const completedPayments = payments.filter(p => isCompleted(p.status));

    // Calculate totals
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalTransactions = completedPayments.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Trends calculation (comparing last 7 days vs previous 7 days)
    const last7DaysPayments = completedPayments.filter(p => new Date(p.date || p.created_at) >= last7Days);
    const previous7DaysPayments = completedPayments.filter(p => {
        const date = new Date(p.date || p.created_at);
        return date >= last14Days && date < last7Days;
    });

    const last7DaysRevenue = last7DaysPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const previous7DaysRevenue = previous7DaysPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const revenueTrend = previous7DaysRevenue > 0
        ? ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100
        : 0;

    const last7DaysTransactions = last7DaysPayments.length;
    const previous7DaysTransactions = previous7DaysPayments.length;
    const transactionsTrend = previous7DaysTransactions > 0
        ? ((last7DaysTransactions - previous7DaysTransactions) / previous7DaysTransactions) * 100
        : 0;

    // Payment method distribution
    const methodCounts = {};
    const methodRevenue = {};
    completedPayments.forEach(p => {
        const method = p.paymentMethodCode || p.method || 'Unknown';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
        methodRevenue[method] = (methodRevenue[method] || 0) + (parseFloat(p.amount) || 0);
    });

    const sortedMethods = Object.entries(methodCounts).sort((a, b) => b[1] - a[1]);
    const mostUsedMethodRaw = sortedMethods[0];
    const mostUsedMethodCode = mostUsedMethodRaw ? mostUsedMethodRaw[0] : 'N/A';
    const mostUsedMethodName = PAYMENT_METHODS[mostUsedMethodCode] || mostUsedMethodCode;
    const mostUsedMethodPercentage = mostUsedMethodRaw && totalTransactions > 0
        ? (mostUsedMethodRaw[1] / totalTransactions) * 100
        : 0;

    // History for sparklines/charts
    const last7DaysHistory = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayPayments = completedPayments.filter(p => {
            const pDate = new Date(p.date || p.created_at);
            return pDate.toDateString() === date.toDateString();
        });
        const dayRevenue = dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const dayCount = dayPayments.length;

        last7DaysHistory.push({
            date: date.toISOString(),
            revenue: dayRevenue,
            transactions: dayCount,
            average: dayCount > 0 ? dayRevenue / dayCount : 0,
        });
    }

    return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        mostUsedMethod: mostUsedMethodName,
        mostUsedMethodPercentage,
        revenueTrend,
        transactionsTrend,
        avgTrend: 0, // Placeholder
        last7DaysHistory,
        methodDistribution: Object.entries(methodCounts).map(([code, count]) => ({
            method: PAYMENT_METHODS[code] || code,
            code,
            count,
            percentage: (count / totalTransactions) * 100,
            total: methodRevenue[code],
        })),
    };
};
export default samplePaymentData;
