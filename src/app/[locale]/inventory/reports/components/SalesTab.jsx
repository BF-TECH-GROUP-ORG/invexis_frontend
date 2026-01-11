import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Fade } from '@mui/material';
import ReportKPI from './ReportKPI';
import ReportTable from './ReportTable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import analyticsService from '@/services/analyticsService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

const SalesTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentSales, setRecentSales] = useState([]);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockStats = {
                    totalDailySales: 45800000,
                    totalDailyProfit: 12400000,
                    totalOrders: 856
                };

                const mockSales = [
                    { id: 1, date: '2023-10-12', orderCount: 42, revenue: 2450000, profit: 680000 },
                    { id: 2, date: '2023-10-11', orderCount: 38, revenue: 1850000, profit: 520000 },
                    { id: 3, date: '2023-10-10', orderCount: 55, revenue: 3200000, profit: 940000 },
                    { id: 4, date: '2023-10-09', orderCount: 48, revenue: 2100000, profit: 590000 },
                    { id: 5, date: '2023-10-08', orderCount: 62, revenue: 4500000, profit: 1350000 },
                    { id: 6, date: '2023-10-07', orderCount: 31, revenue: 1200000, profit: 340000 },
                    { id: 7, date: '2023-10-06', orderCount: 45, revenue: 2800000, profit: 780000 },
                    { id: 8, date: '2023-10-05', orderCount: 52, revenue: 3500000, profit: 980000 },
                    { id: 9, date: '2023-10-04', orderCount: 39, revenue: 1950000, profit: 540000 },
                    { id: 10, date: '2023-10-03', orderCount: 47, revenue: 2600000, profit: 720000 },
                ];

                setStats(mockStats);
                setRecentSales(mockSales);
                setLoading(false);
            }, 800);
        };

        fetchData();
    }, [companyId, dateRange]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const columns = [
        { field: 'date', label: 'Date', render: (row) => dayjs(row.date).format('MMM DD, YYYY') },
        {
            field: 'orderCount', label: 'Orders', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="700">{row.orderCount}</Typography>
            )
        },
        {
            field: 'revenue', label: 'Revenue', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="800" sx={{ color: "#111827" }}>
                    {parseFloat(row.revenue).toLocaleString()} FRW
                </Typography>
            )
        },
        {
            field: 'profit', label: 'Est. Profit', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="700" sx={{ color: "#10B981" }}>
                    {row.profit ? `${parseFloat(row.profit).toLocaleString()} FRW` : '-'}
                </Typography>
            )
        }
    ];

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 0, sm: 3 }} sx={{ mb: 4, width: '100%', m: 0 }}>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Total Revenue"
                            value={`${parseFloat(stats?.totalDailySales || 0).toLocaleString()} FRW`}
                            icon={AttachMoneyIcon}
                            color="#FF6D00"
                            trend="up"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Net Profit"
                            value={`${parseFloat(stats?.totalDailyProfit || 0).toLocaleString()} FRW`}
                            icon={TrendingUpIcon}
                            color="#10B981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Total Orders"
                            value={stats?.totalOrders || 0}
                            icon={ShoppingCartIcon}
                            color="#3B82F6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Avg Order Value"
                            value={stats?.totalOrders > 0 ? `${(parseFloat(stats.totalDailySales) / stats.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 })} FRW` : "0 FRW"}
                            icon={ReceiptLongIcon}
                            color="#8B5CF6"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <ReportTable
                        title="Sales Performance History"
                        columns={columns}
                        data={recentSales}
                        onExport={() => console.log("Export Sales")}
                        onPrint={() => console.log("Print Sales")}
                    />
                </Box>
            </Box>
        </Fade>
    );
};

export default SalesTab;
