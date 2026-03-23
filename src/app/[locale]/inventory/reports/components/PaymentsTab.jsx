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
import reportService from '@/services/reportService';
import { getBranches } from '@/services/branches';
import dayjs from 'dayjs';
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const PaymentsTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;
    const filter = dateRange.filter || 'daily';

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
    const [selectedActor, setSelectedActor] = useState(t('common.all'));

    // Menu Anchors
    const [branchAnchor, setBranchAnchor] = useState(null);
    const [actorAnchor, setActorAnchor] = useState(null);

    // Fetch shops for name mapping
    const { data: shops = [] } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getBranches(companyId),
        enabled: !!companyId,
        staleTime: Infinity,
    });

    const getShopName = (shopId) => {
        if (!shopId || shopId === 'Default') return 'Default';
        const shop = shops.find(s => String(s._id || s.id) === String(shopId));
        return shop ? shop.name : shopId;
    };

    const {
        data: rawReportData,
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-payments-v1', companyId, startDate, endDate, filter],
        queryFn: () => reportService.getPaymentsReport(companyId, { startDate, endDate, filter }),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });

    // Transform and map data
    const { kpis, reportData } = React.useMemo(() => {
        if (!rawReportData?.data) return { kpis: null, reportData: [] };
        
        const { branches, period } = rawReportData.data;
        
        const periodText = period 
            ? `${dayjs(period.startDate).format('MM/DD/YYYY')} - ${dayjs(period.endDate).format('MM/DD/YYYY')}`
            : t('common.currentPeriod');

        const filteredBranches = selectedBranch === t('common.all') 
            ? branches 
            : branches.filter(b => b.shopId === selectedBranch);

        let grandReceived = 0;
        let grandPending = 0;
        let grandFailed = 0;
        let grandDebt = 0;
        let grandSucceededCount = 0;

        // Map backend actors if needed (currently handling receivedBy via description field in reference)
        let processedBranches = filteredBranches.map(branch => {
            let payments = branch.payments;
            if (selectedActor !== t('common.all')) {
                payments = payments.filter(p => p.reference?.description === selectedActor);
            }

            // Frontend-side subtotal calculation for accuracy
            let branchReceived = 0;
            let branchPending = 0;
            let branchFailed = 0;
            let branchDebt = 0;

            const mappedPayments = payments.map(p => {
                const amount = Number(p.paymentInfo?.amount) || 0;
                const status = (p.status || '').toLowerCase();

                if (status === 'succeeded' || status === 'paid') {
                    branchReceived += amount;
                    grandReceived += amount;
                    grandSucceededCount++;
                } else if (status === 'pending') {
                    branchPending += amount;
                    grandPending += amount;
                } else if (status === 'failed') {
                    branchFailed += amount;
                    grandFailed += amount;
                } else if (status === 'debt') {
                    branchDebt += amount;
                    grandDebt += amount;
                }

                return {
                    customer: { 
                        name: p.customerInfo?.name || 'Walk-in', 
                        phone: p.customerInfo?.phone || '-' 
                    },
                    invoiceNo: p.invoiceNo,
                    amount: amount,
                    method: p.paymentInfo?.method || 'Unknown',
                    status: p.status,
                    saleDebtRef: p.reference?.id || '-',
                    receivedBy: p.reference?.description || 'System',
                    date: p.reference?.date || '-',
                    time: p.reference?.time || '-'
                };
            });

            return {
                name: getShopName(branch.shopId),
                id: branch.shopId,
                totals: {
                    received: branchReceived,
                    pending: branchPending,
                    failed: branchFailed,
                    debt: branchDebt,
                    count: mappedPayments.length
                },
                payments: mappedPayments
            };
        });

        return {
            kpis: {
                totalReceived: grandReceived,
                pendingPayments: grandPending,
                failedPayments: grandFailed,
                totalDebt: grandDebt,
                avgPaymentSize: grandSucceededCount > 0 ? (grandReceived / grandSucceededCount) : 0
            },
            reportData: [{
                date: periodText,
                branches: processedBranches
            }]
        };
    }, [rawReportData, selectedBranch, selectedActor, shops, t]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => `${(val || 0).toLocaleString()} FRW`;

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
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'succeeded' || s === 'paid') return { color: '#10B981', bg: '#F0FDF4', border: '#DCFCE7' };
        if (s === 'pending') return { color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' };
        if (s === 'debt') return { color: '#3B82F6', bg: '#EFF6FF', border: '#DBEAFE' };
        return { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' };
    };

    const getTranslatedStatus = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'succeeded' || s === 'paid') return t('payments.status.completed');
        if (s === 'pending') return t('payments.status.pending');
        if (s === 'failed') return t('payments.status.failed');
        if (s === 'debt') return 'Debt';
        return status || '-';
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
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                            const val = kpis?.pendingPayments || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.pendingPayments || 0)}
                        icon={AccessTimeIcon}
                        color="#F59E0B"
                        index={1}
                    />
                    <ReportKPI
                        title={t('payments.kpis.failed')}
                        value={(() => {
                            const val = kpis?.failedPayments || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.failedPayments || 0)}
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
                                        {selectedBranch === t('common.all') ? t('common.branch') : getShopName(selectedBranch)} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
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
                                <TableCell align="center">{t('common.date')}</TableCell>
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
                                                        <TableCell align="center" sx={{ fontWeight: "600" }}>
                                                            {payment.invoiceNo && payment.invoiceNo.startsWith('http') ? (
                                                                <Link 
                                                                    href={payment.invoiceNo} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: '#FF6D00', textDecoration: 'none', fontWeight: '600' }}
                                                                >
                                                                    {t('common.invoice')}
                                                                </Link>
                                                            ) : (payment.invoiceNo || '-')}
                                                        </TableCell>
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
                                                        <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{payment.date}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>{payment.time}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Shop Subtotal Row */}
                                            <TableRow sx={{ bgcolor: "#e9824bff", "& td": { color: "white", fontWeight: "700", fontSize: "0.80rem", py: 0.8, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                                <TableCell colSpan={3} sx={{ pl: 2 }}>{t('common.subtotal', { name: branch.name })}</TableCell>
                                                <TableCell colSpan={3} />
                                                <TableCell align="right">{formatCurrency(branch.totals?.received || 0)}</TableCell>
                                                <TableCell align="center">-</TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem' }}>
                                                    P: {formatCurrency(branch.totals?.pending || 0)} / F: {formatCurrency(branch.totals?.failed || 0)} / D: {formatCurrency(branch.totals?.debt || 0)}
                                                </TableCell>
                                                <TableCell colSpan={3} />
                                            </TableRow>
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                            
                            {/* Spacer Row before Grand Total */}
                            <TableRow sx={{ height: 16 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>

                            {/* Grand Total Row */}
                            <TableRow sx={{ bgcolor: "#3b2005ff", "& td": { color: "white", fontWeight: "800", fontSize: "0.85rem", py: 1.2, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                <TableCell colSpan={3} sx={{ pl: 2 }}>{t('common.total')}</TableCell>
                                <TableCell colSpan={3} />
                                <TableCell align="right">{formatCurrency(kpis?.totalReceived || 0)}</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                                    P: {formatCurrency(kpis?.pendingPayments || 0)} / F: {formatCurrency(kpis?.failedPayments || 0)} / D: {formatCurrency(kpis?.totalDebt || 0)}
                                </TableCell>
                                <TableCell colSpan={3} />
                            </TableRow>
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
                    <Divider />
                    {rawReportData?.data?.branches?.map((branch) => (
                        <MenuItem key={branch.shopId} onClick={() => handleBranchSelect(branch.shopId)}>
                            {getShopName(branch.shopId)}
                        </MenuItem>
                    ))}
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
                    {Array.from(new Set(rawReportData?.data?.branches?.flatMap(b => b.payments.map(p => p.reference?.description)) || [])).filter(Boolean).map((actor) => (
                        <MenuItem key={actor} onClick={() => handleActorSelect(actor)}>
                            {actor}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Fade>
    );
};

export default PaymentsTab;
