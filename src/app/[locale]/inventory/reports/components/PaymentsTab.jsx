import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Fade } from '@mui/material';
import ReportKPI from './ReportKPI';
import ReportTable from './ReportTable';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import analyticsService from '@/services/analyticsService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

const PaymentsTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [paymentStats, setPaymentStats] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockStats = [
                    { method: 'Mobile Money (MoMo)', totalAmount: 12500000, count: 450 },
                    { method: 'Cash', totalAmount: 8400000, count: 320 },
                    { method: 'Credit Card', totalAmount: 5600000, count: 120 },
                    { method: 'Bank Transfer', totalAmount: 3200000, count: 45 },
                    { method: 'Debt/Credit', totalAmount: 1500000, count: 85 },
                ];

                const total = mockStats.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);

                setPaymentStats(mockStats);
                setTotalReceived(total);
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
        {
            field: 'method',
            label: 'Payment Method',
            render: (row) => (
                <Typography variant="body2" fontWeight="700" sx={{ color: "#374151" }}>
                    {row.method?.toUpperCase()}
                </Typography>
            )
        },
        {
            field: 'count', label: 'Transactions', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="600">{row.count}</Typography>
            )
        },
        {
            field: 'totalAmount', label: 'Total Amount', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="800" sx={{ color: "#111827" }}>
                    {parseFloat(row.totalAmount).toLocaleString()} FRW
                </Typography>
            )
        },
        {
            field: 'percentage',
            label: 'Share',
            align: 'right',
            render: (row) => {
                const pct = totalReceived > 0 ? (row.totalAmount / totalReceived) * 100 : 0;
                return (
                    <Box component="span" sx={{
                        px: 1.5, py: 0.5, borderRadius: "20px",
                        bgcolor: "#F3F4F6",
                        color: "#374151",
                        fontWeight: '700', fontSize: '0.7rem',
                        border: "1px solid #E5E7EB"
                    }}>
                        {pct.toFixed(1)}%
                    </Box>
                );
            }
        }
    ];

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 0, sm: 3 }} sx={{ mb: 4, width: '100%', m: 0 }}>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Total Received"
                            value={`${totalReceived.toLocaleString()} FRW`}
                            icon={AccountBalanceWalletIcon}
                            color="#10B981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Pending Payments"
                            value="450,000 FRW"
                            icon={AccessTimeIcon}
                            color="#F59E0B"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Failed Payments"
                            value="120,000 FRW"
                            icon={CancelIcon}
                            color="#EF4444"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Top Method"
                            value={paymentStats.length > 0 ? paymentStats.sort((a, b) => b.totalAmount - a.totalAmount)[0]?.method?.toUpperCase() : "N/A"}
                            icon={PieChartIcon}
                            color="#3B82F6"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <ReportTable
                        title="Payment Methods Breakdown"
                        columns={columns}
                        data={paymentStats}
                        onExport={() => console.log("Export Payments")}
                        onPrint={() => console.log("Print Payments")}
                    />
                </Box>
            </Box>
        </Fade>
    );
};

export default PaymentsTab;
