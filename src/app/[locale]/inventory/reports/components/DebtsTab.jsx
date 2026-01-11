import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Fade } from '@mui/material';
import ReportKPI from './ReportKPI';
import ReportTable from './ReportTable';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import debtsService from '@/services/debts';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

const DebtsTab = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        totalOutstanding: 0,
        overdueAmount: 0,
        debtorsCount: 0,
        avgDebtAge: 0
    });
    const [debtors, setDebtors] = useState([]);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockDebts = [
                    { id: 1, customer: { name: 'Jean Pierre', phone: '0788123456' }, balance: 450000, dueDate: dayjs().subtract(5, 'day').toISOString(), createdAt: dayjs().subtract(45, 'day').toISOString() },
                    { id: 2, customer: { name: 'Sarah M.', phone: '0788654321' }, balance: 120000, dueDate: dayjs().add(10, 'day').toISOString(), createdAt: dayjs().subtract(20, 'day').toISOString() },
                    { id: 3, customer: { name: 'Kigali Heights Corp', phone: '0788000111' }, balance: 2500000, dueDate: dayjs().subtract(35, 'day').toISOString(), createdAt: dayjs().subtract(60, 'day').toISOString() },
                    { id: 4, customer: { name: 'Emmanuel R.', phone: '0788222333' }, balance: 85000, dueDate: dayjs().add(2, 'day').toISOString(), createdAt: dayjs().subtract(15, 'day').toISOString() },
                    { id: 5, customer: { name: 'Marie Claire', phone: '0788444555' }, balance: 320000, dueDate: dayjs().subtract(12, 'day').toISOString(), createdAt: dayjs().subtract(40, 'day').toISOString() },
                    { id: 6, customer: { name: 'Tech Solutions Ltd', phone: '0788777888' }, balance: 1500000, dueDate: dayjs().add(15, 'day').toISOString(), createdAt: dayjs().subtract(10, 'day').toISOString() },
                ];

                let total = 0;
                let overdue = 0;
                let uniqueDebtors = new Set();
                let totalAgeDays = 0;
                let activeDebtsCount = 0;

                const processedDebts = mockDebts.map(debt => {
                    const balance = parseFloat(debt.balance || 0);
                    const isOverdue = dayjs().isAfter(dayjs(debt.dueDate));

                    if (balance > 0) {
                        total += balance;
                        uniqueDebtors.add(debt.customer?.phone || debt.customer?.name);
                        activeDebtsCount++;

                        if (isOverdue) {
                            overdue += balance;
                        }

                        const age = dayjs().diff(dayjs(debt.createdAt), 'day');
                        totalAgeDays += age;
                    }

                    return {
                        ...debt,
                        isOverdue
                    };
                });

                setKpis({
                    totalOutstanding: total,
                    overdueAmount: overdue,
                    debtorsCount: uniqueDebtors.size,
                    avgDebtAge: activeDebtsCount > 0 ? Math.round(totalAgeDays / activeDebtsCount) : 0
                });

                setDebtors(processedDebts);
                setLoading(false);
            }, 800);
        };

        fetchData();
    }, [companyId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const columns = [
        {
            field: 'customer',
            label: 'Debtor',
            render: (row) => (
                <Typography variant="body2" fontWeight="700" sx={{ color: "#374151" }}>
                    {row.customer?.name || "Unknown"}
                </Typography>
            )
        },
        {
            field: 'balance',
            label: 'Remaining Balance',
            align: 'right',
            render: (row) => (
                <Typography variant="body2" fontWeight="800" sx={{ color: "#DC2626" }}>
                    {parseFloat(row.balance).toLocaleString()} FRW
                </Typography>
            )
        },
        {
            field: 'dueDate',
            label: 'Due Date',
            render: (row) => dayjs(row.dueDate).format('MMM DD, YYYY')
        },
        {
            field: 'status',
            label: 'Risk Level',
            align: 'right',
            render: (row) => {
                const daysOverdue = dayjs().diff(dayjs(row.dueDate), 'day');
                let color = "#10B981";
                let text = "Low Risk";
                let bgcolor = "#F0FDF4";
                let border = "#DCFCE7";

                if (daysOverdue > 30) {
                    color = "#DC2626";
                    text = "High Risk";
                    bgcolor = "#FEF2F2";
                    border = "#FEE2E2";
                } else if (daysOverdue > 0) {
                    color = "#D97706";
                    text = "Overdue";
                    bgcolor = "#FFFBEB";
                    border = "#FEF3C7";
                }

                return (
                    <Box component="span" sx={{
                        px: 1.5, py: 0.5, borderRadius: "20px",
                        bgcolor: bgcolor,
                        color: color,
                        fontWeight: '700', fontSize: '0.7rem',
                        border: `1px solid ${border}`
                    }}>
                        {text}
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
                            title="Total Outstanding"
                            value={`${(kpis.totalOutstanding || 0).toLocaleString()} FRW`}
                            icon={AccountBalanceIcon}
                            color="#FF6D00"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Overdue Amount"
                            value={`${(kpis.overdueAmount || 0).toLocaleString()} FRW`}
                            icon={WarningIcon}
                            color="#EF4444"
                            trend="down"
                            trendValue="Critical"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Active Debtors"
                            value={kpis.debtorsCount || 0}
                            icon={PeopleIcon}
                            color="#3B82F6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Avg Debt Age"
                            value={`${kpis.avgDebtAge || 0} Days`}
                            icon={TimerIcon}
                            color="#8B5CF6"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <ReportTable
                        title="Outstanding Debts"
                        columns={columns}
                        data={debtors}
                        onExport={() => console.log("Export Debts")}
                        onPrint={() => console.log("Print Debts")}
                    />
                </Box>
            </Box>
        </Fade>
    );
};

export default DebtsTab;
