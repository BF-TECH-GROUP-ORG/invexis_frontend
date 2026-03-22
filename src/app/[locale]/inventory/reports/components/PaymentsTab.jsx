"use client";

import React, { useState, useEffect } from 'react';
import {
    Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table,
    TableHead, TableBody, TableCell, TableRow, Menu, MenuItem, Divider, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import ReportKPI from './ReportKPI';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import * as paymentService from '@/services/paymentService';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const PaymentsTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
    const [selectedActor, setSelectedActor] = useState(t('common.all'));

    // Menu Anchors
    const [branchAnchor, setBranchAnchor] = useState(null);
    const [actorAnchor, setActorAnchor] = useState(null);

    const {
        data: rawPayments = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-payments', companyId, startDate, endDate, selectedBranch, selectedActor],
        queryFn: () => paymentService.getCompanyPayments(companyId),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    // Process KPIs and report data structure
    const { kpis, reportData } = React.useMemo(() => {
        let payments = Array.isArray(rawPayments) ? rawPayments : [];

        // Apply filters (since service might not support all filters yet)
        let filtered = payments.filter(p => {
            const pDate = dayjs(p.createdAt);
            const inRange = (!startDate || pDate.isAfter(dayjs(startDate).subtract(1, 'day'))) && 
                          (!endDate || pDate.isBefore(dayjs(endDate).add(1, 'day')));
            const branchMatch = selectedBranch === t('common.all') || p.shopId === selectedBranch;
            const actorMatch = selectedActor === t('common.all') || p.recordedBy === selectedActor;
            return inRange && branchMatch && actorMatch;
        });

        let totalReceived = 0, pendingAmount = 0, failedAmount = 0, paymentCount = 0;
        const groupedByDate = {};

        filtered.forEach(p => {
            paymentCount++;
            if (p.status === 'Completed' || p.status === 'SUCCESS' || p.status === 'success') totalReceived += p.amount;
            else if (p.status === 'Pending' || p.status === 'PENDING') pendingAmount += p.amount;
            else if (p.status === 'Failed' || p.status === 'FAILED') failedAmount += p.amount;

            const dateStr = dayjs(p.createdAt).format('MM/DD/YYYY');
            if (!groupedByDate[dateStr]) groupedByDate[dateStr] = { date: dateStr, branches: {} };
            
            const branchName = p.shopId || 'Default';
            if (!groupedByDate[dateStr].branches[branchName]) groupedByDate[dateStr].branches[branchName] = { name: branchName, payments: [] };
            
            groupedByDate[dateStr].branches[branchName].payments.push({
                customer: { name: p.customerName || 'Walk-in', phone: p.customerPhone || '-' },
                invoiceNo: p.invoiceNo || p.id?.slice(-8).toUpperCase(),
                amount: p.amount || 0,
                method: p.paymentMethod || 'Cash',
                status: p.status === 'success' || p.status === 'SUCCESS' ? 'Completed' : p.status,
                saleDebtRef: p.saleId || p.debtId || '-',
                receivedBy: p.recordedBy || 'System',
                time: dayjs(p.createdAt).format('hh:mm A')
            });
        });

        const reportDataFormatted = Object.values(groupedByDate).map(day => ({
            ...day,
            branches: Object.values(day.branches)
        }));

        return {
            kpis: {
                totalReceived,
                pendingAmount,
                failedAmount,
                avgPaymentSize: paymentCount > 0 ? Math.round(totalReceived / paymentCount) : 0
            },
            reportData: reportDataFormatted
        };
    }, [rawPayments, startDate, endDate, selectedBranch, selectedActor, t]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => `${val.toLocaleString()} FRW`;

    const handleBranchClick = (event) => setBranchAnchor(event.currentTarget);
    const handleActorClick = (event) => setActorAnchor(event.currentTarget);
    const handleClose = () => { setBranchAnchor(null); setActorAnchor(null); };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        handleClose();
    };

    const handleActorSelect = (actor) => {
        setSelectedActor(actor);
        handleClose();
    };


    const getStatusColor = (status) => {
        if (status === 'Completed') return { color: '#10B981', bg: '#F0FDF4', border: '#DCFCE7' };
        if (status === 'Pending') return { color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' };
        return { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' };
    };

    const getTranslatedStatus = (status) => {
        if (status === 'Completed') return t('payments.status.completed');
        if (status === 'Pending') return t('payments.status.pending');
        if (status === 'Failed') return t('payments.status.failed');
        return status;
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, and Date Picker */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1.5 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        {t('payments.title')}
                    </Typography>

                </Box>

                {/* Top KPIs */}
                <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '32px'
                }}
                    className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <ReportKPI
                        title={t('payments.kpis.received')}
                        value={(() => {
                            const val = kpis?.totalReceived || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.totalReceived || 0)}
                        icon={AccountBalanceWalletIcon}
                        color="#10B981"
                        index={0}
                    />
                    <ReportKPI
                        title={t('payments.kpis.pending')}
                        value={(() => {
                            const val = kpis?.pendingAmount || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.pendingAmount || 0)}
                        icon={AccessTimeIcon}
                        color="#F59E0B"
                        index={1}
                    />
                    <ReportKPI
                        title={t('payments.kpis.failed')}
                        value={(() => {
                            const val = kpis?.failedAmount || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.failedAmount || 0)}
                        icon={CancelIcon}
                        color="#EF4444"
                        index={2}
                    />
                    <ReportKPI
                        title={t('payments.kpis.avgSize')}
                        value={(() => {
                            const val = kpis?.avgPaymentSize || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.avgPaymentSize || 0)}
                        icon={PieChartIcon}
                        color="#3B82F6"
                        index={3}
                    />
                </div>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none" }}>
                    <Table size="small">
                        <TableHead>
                            {/* Main Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">
                                    {dateRange.startDate ? (
                                        `${dateRange.startDate.format('MM/DD/YYYY')} - ${dateRange.endDate?.format('MM/DD/YYYY') || ''}`
                                    ) : (
                                        t('common.date')
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        {selectedBranch === t('common.all') ? t('common.branch') : selectedBranch} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleActorClick}>
                                        {selectedActor === t('common.all') ? t('common.receivedBy') : selectedActor} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center" colSpan={2}>{t('debts.table.customerInfo')}</TableCell>
                                <TableCell align="center">{t('common.invoiceNo')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('debts.table.paymentInfo')}</TableCell>
                                <TableCell align="center">{t('common.status')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('payments.table.reference')}</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={3} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">{t('common.name')}</TableCell>
                                <TableCell align="center">{t('common.phone')}</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">{t('common.amount')}</TableCell>
                                <TableCell align="center">{t('common.method')}</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">{t('payments.table.saleDebtRef')}</TableCell>
                                <TableCell align="center">{t('common.status')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('common.time')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((day, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    {/* Date Row */}
                                    <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", py: 1 } }}>
                                        <TableCell sx={{ borderRight: "1px solid #e5e7eb" }}>{day.date}</TableCell>
                                        <TableCell colSpan={11} />
                                    </TableRow>
                                    {day.branches.map((branch, bIdx) => (
                                        <React.Fragment key={bIdx}>
                                            {/* Branch Header Row */}
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{branch.name}</TableCell>
                                                <TableCell colSpan={9} />
                                            </TableRow>
                                            {branch.payments?.map((payment, pIdx) => {
                                                const statusColor = getStatusColor(payment.status);
                                                return (
                                                    <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                        <TableCell />
                                                        <TableCell />
                                                        <TableCell sx={{ pl: 2, fontWeight: "600" }}>{payment.receivedBy}</TableCell>
                                                        <TableCell sx={{ pl: 2, fontWeight: "600" }}>{payment.customer.name}</TableCell>
                                                        <TableCell align="center">{payment.customer.phone}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "600" }}>{payment.invoiceNo}</TableCell>
                                                        <TableCell align="right" sx={{ color: "#10B981", fontWeight: "600" }}>{formatCurrency(payment.amount)}</TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{payment.method}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "1px solid #e5e7eb" }}>
                                                            <Box sx={{
                                                                px: 1, py: 0.3, borderRadius: "12px",
                                                                bgcolor: statusColor.bg,
                                                                color: statusColor.color,
                                                                fontWeight: '700', fontSize: '0.65rem',
                                                                border: `1px solid ${statusColor.border}`
                                                            }}>
                                                                {getTranslatedStatus(payment.status)}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{payment.saleDebtRef}</TableCell>
                                                        <TableCell align="center">{payment.time}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>-</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>


                {/* Branch Selection Menu */}
                <Menu
                    anchorEl={branchAnchor}
                    open={Boolean(branchAnchor)}
                    onClose={handleClose}
                    PaperProps={{ sx: { width: 200, borderRadius: 0 } }}
                >
                    <MenuItem onClick={() => handleBranchSelect(t('common.all'))}>{t('common.all')}</MenuItem>
                    <MenuItem onClick={() => handleBranchSelect(t('common.none'))}>{t('common.none')}</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleBranchSelect('North Branch')}>North Branch</MenuItem>
                    <MenuItem onClick={() => handleBranchSelect('South Branch')}>South Branch</MenuItem>
                </Menu>

                {/* Actor Selection Menu */}
                <Menu
                    anchorEl={actorAnchor}
                    open={Boolean(actorAnchor)}
                    onClose={handleClose}
                    PaperProps={{ sx: { width: 200, borderRadius: 0 } }}
                >
                    <MenuItem onClick={() => handleActorSelect(t('common.all'))}>{t('common.all')}</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleActorSelect('Alice')}>Alice</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Bob')}>Bob</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Charlie')}>Charlie</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Diana')}>Diana</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Eve')}>Eve</MenuItem>
                </Menu>
            </Box>
        </Fade>
    );
};

export default PaymentsTab;
