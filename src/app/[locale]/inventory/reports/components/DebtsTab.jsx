"use client";

import React, { useState, useMemo } from 'react';
import {
    Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table,
    TableHead, TableBody, TableCell, TableRow, Menu, MenuItem, Divider
} from '@mui/material';
import ReportKPI from './ReportKPI';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/Download';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import reportService from '@/services/reportService';
import { getBranches } from '@/services/branches';
import dayjs from 'dayjs';
import Link from 'next/link';

const DebtsTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
    const [branchAnchor, setBranchAnchor] = useState(null);

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;
    const filter = dateRange.filter || 'daily';

    // Fetch hierarchical report data
    const {
        data: reportResponse,
        isLoading: reportLoading
    } = useQuery({
        queryKey: ['report-debts-v1', companyId, startDate, endDate, filter],
        queryFn: () => reportService.getDebtReport(companyId, { startDate, endDate, filter }),
        enabled: !!companyId,
    });

    // Fetch branches for name mapping
    const { data: shops = [] } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getBranches(companyId),
        enabled: !!companyId,
    });

    const getShopName = (shopId) => {
        const shop = shops.find(s => s.id === shopId || s._id === shopId);
        return shop ? shop.name : `Branch ${shopId.slice(-8)}`;
    };

    // Process KPIs and report data structure
    const { summary, reportData } = useMemo(() => {
        if (!reportResponse?.data) {
            return { summary: {}, reportData: [] };
        }

        const { grandTotal, branches } = reportResponse.data;
        
        // Group by Date -> Branch -> Debts for the UI hierarchy
        // The API returns grouping by Branch, so we pivot for the UI if multiple days are involved
        // But since the parent pass a dateRange, we can show that as a top level date row
        const dateStr = dateRange.startDate ? dateRange.startDate.format('MM/DD/YYYY') : dayjs().format('MM/DD/YYYY');
        
        const filteredBranches = selectedBranch === t('common.all') 
            ? branches 
            : branches.filter(b => b.shopId === selectedBranch);

        const hierarchicalData = [{
            date: dateStr,
            branches: filteredBranches.map(b => ({
                id: b.shopId,
                name: getShopName(b.shopId),
                totals: b.totals,
                debts: b.debts || []
            }))
        }];

        return {
            summary: grandTotal,
            reportData: hierarchicalData
        };
    }, [reportResponse, selectedBranch, shops, t]);

    const loading = reportLoading;

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return "0 FRW";
        return `${val.toLocaleString()} FRW`;
    };

    const handleBranchClick = (event) => setBranchAnchor(event.currentTarget);
    const handleClose = () => { setBranchAnchor(null); };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        handleClose();
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PARTIALLY_PAID':
                return { color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', label: t('debts.status.pending') };
            case 'PAID':
                return { color: '#059669', bg: '#ECFDF5', border: '#D1FAE5', label: t('common.paid') };
            case 'UNPAID':
            default:
                return { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2', label: t('debts.status.pending') };
        }
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827" }}>
                        {t('debts.title')}
                    </Typography>
                </Box>

                {/* Top KPIs */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                    <ReportKPI
                        title={t('debts.kpis.totalOutstanding')}
                        value={(() => {
                            const val = summary?.outstanding || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(summary?.outstanding || 0)}
                        icon={AccountBalanceIcon}
                        color="#FF6D00"
                        index={0}
                    />
                    <ReportKPI
                        title={t('debts.kpis.overdueAmount')}
                        value={(() => {
                            const val = summary?.overdue || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(summary?.overdue || 0)}
                        icon={WarningIcon}
                        color="#EF4444"
                        index={1}
                    />
                    <ReportKPI
                        title={t('debts.kpis.activeDebtors')}
                        value={summary?.activeDebtors || 0}
                        icon={PeopleIcon}
                        color="#3B82F6"
                        index={2}
                    />
                    <ReportKPI
                        title={t('debts.kpis.avgDebtAge')}
                        value={`${summary?.avgAge || 0} ${t('common.days')}`}
                        icon={TimerIcon}
                        color="#8B5CF6"
                        index={3}
                    />
                </Box>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px", overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", py: 1.5, fontSize: "0.85rem" } }}>
                                <TableCell align="center" sx={{ minWidth: 150 }}>
                                    {dateRange.startDate ? `${dateRange.startDate.format('MM/DD/YYYY')} - ${dateRange.endDate?.format('MM/DD/YYYY') || ''}` : t('common.date')}
                                </TableCell>
                                <TableCell align="center" sx={{ minWidth: 150 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        {selectedBranch === t('common.all') ? t('common.branch') : getShopName(selectedBranch)} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{t('common.invoiceNo')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('debts.table.customerInfo')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('debts.table.debtAmount')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('debts.table.paymentInfo')}</TableCell>
                                <TableCell align="center">{t('common.status')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('common.tracking')}</TableCell>
                            </TableRow>
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", py: 0.5, fontSize: "0.7rem" } }}>
                                <TableCell colSpan={3} />
                                <TableCell align="center">{t('common.name')}</TableCell>
                                <TableCell align="center">{t('common.phone')}</TableCell>
                                <TableCell align="center">{t('debts.table.original')}</TableCell>
                                <TableCell align="center">{t('debts.table.paid')}</TableCell>
                                <TableCell align="center">{t('debts.table.balance')}</TableCell>
                                <TableCell align="center">{t('debts.table.lastPaid')}</TableCell>
                                <TableCell align="center">{t('debts.table.dueDate')}</TableCell>
                                <TableCell align="center">{t('debts.table.age')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }} />
                                <TableCell align="center">{t('debts.table.saleDate')}</TableCell>
                                <TableCell align="center">{t('common.recordedBy')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>-</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((day, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    <TableRow sx={{ bgcolor: "#F9FAFB", '& td': { fontWeight: "700", py: 1, borderRight: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" } }}>
                                        <TableCell align="center">{day.date}</TableCell>
                                        <TableCell colSpan={13} />
                                    </TableRow>
                                    {day.branches.map((branch, bIdx) => (
                                        <React.Fragment key={bIdx}>
                                            <TableRow sx={{ bgcolor: "white", '& td': { fontWeight: "700", py: 0.5, borderRight: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" } }}>
                                                <TableCell sx={{ borderRight: "1px solid #E5E7EB" }} />
                                                <TableCell align="center" sx={{ color: "#FF6D00" }}>{branch.name}</TableCell>
                                                <TableCell colSpan={12} />
                                            </TableRow>
                                            {branch.debts.map((debt, pIdx) => {
                                                const status = getStatusStyles(debt.status);
                                                const isOverdue = debt.paymentInfo.dueDate && dayjs().isAfter(dayjs(debt.paymentInfo.dueDate)) && debt.amount.balance > 0;
                                                const displayStatus = isOverdue ? { ...status, label: t('debts.status.overdue'), color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' } : status;

                                                return (
                                                    <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderRight: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", fontSize: "0.8rem", py: 0.5 } }}>
                                                        <TableCell />
                                                        <TableCell />
                                                        <TableCell align="center">
                                                            {debt.invoiceUrl ? (
                                                                <Link 
                                                                    href={debt.invoiceUrl} 
                                                                    target="_blank" 
                                                                    download 
                                                                    style={{ 
                                                                        color: '#3B82F6', 
                                                                        textDecoration: 'none', 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        justifyContent: 'center',
                                                                        gap: '4px',
                                                                        fontWeight: '600'
                                                                    }}
                                                                >
                                                                    <DownloadIcon sx={{ fontSize: 16 }} />
                                                                    {t('common.invoice')}
                                                                </Link>
                                                            ) : debt.invoiceNo}
                                                        </TableCell>
                                                        <TableCell sx={{ pl: 2, fontWeight: "600" }}>{debt.customer.name}</TableCell>
                                                        <TableCell align="center">{debt.customer.phone}</TableCell>
                                                        <TableCell align="center">{formatCurrency(debt.amount.total)}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#10B981", fontWeight: "600" }}>{formatCurrency(debt.amount.paid)}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#EF4444", fontWeight: "700" }}>{formatCurrency(debt.amount.balance)}</TableCell>
                                                        <TableCell align="center">{debt.paymentInfo.lastPaid ? dayjs(debt.paymentInfo.lastPaid).format('MM/DD/YYYY') : '-'}</TableCell>
                                                        <TableCell align="center" sx={{ color: isOverdue ? "#EF4444" : "#D97706", fontWeight: "600" }}>
                                                            {debt.paymentInfo.dueDate ? dayjs(debt.paymentInfo.dueDate).format('MM/DD/YYYY') : '-'}
                                                        </TableCell>
                                                        <TableCell align="center">{debt.paymentInfo.age}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>
                                                            <Box sx={{
                                                                px: 1, py: 0.2, borderRadius: "12px",
                                                                bgcolor: displayStatus.bg, color: displayStatus.color,
                                                                fontWeight: '700', fontSize: '0.65rem',
                                                                border: `1px solid ${displayStatus.border}`,
                                                                textAlign: 'center', whiteSpace: 'nowrap'
                                                            }}>
                                                                {displayStatus.label}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">{dayjs(debt.tracking.saleDate).format('MM/DD/YYYY')}</TableCell>
                                                        <TableCell align="center">{debt.tracking.recordedBy}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>-</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Shop Subtotal Row */}
                                            <TableRow sx={{ bgcolor: "#e9824bff", "& td": { color: "white", fontWeight: "700", fontSize: "0.80rem", py: 0.8, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                                <TableCell colSpan={3} sx={{ pl: 2 }}>{t('common.subtotal', { name: branch.name })}</TableCell>
                                                <TableCell colSpan={2} />
                                                <TableCell align="center">{formatCurrency(branch.totals?.original || 0)}</TableCell>
                                                <TableCell align="center">{formatCurrency(branch.totals?.paid || 0)}</TableCell>
                                                <TableCell align="center">{formatCurrency(branch.totals?.outstanding || 0)}</TableCell>
                                                <TableCell colSpan={7} />
                                            </TableRow>
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={14} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                            
                            {/* Spacer Row before Grand Total */}
                            <TableRow sx={{ height: 16 }}><TableCell colSpan={14} sx={{ border: "none" }} /></TableRow>

                            {/* Grand Total Row */}
                            <TableRow sx={{ bgcolor: "#3b2005ff", "& td": { color: "white", fontWeight: "800", fontSize: "0.85rem", py: 1.2, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                <TableCell colSpan={3} sx={{ pl: 2 }}>{t('common.total')}</TableCell>
                                <TableCell colSpan={2} />
                                <TableCell align="center">{formatCurrency(summary?.original || 0)}</TableCell>
                                <TableCell align="center">{formatCurrency(summary?.paid || 0)}</TableCell>
                                <TableCell align="center">{formatCurrency(summary?.outstanding || 0)}</TableCell>
                                <TableCell colSpan={7} />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Menu
                    anchorEl={branchAnchor}
                    open={Boolean(branchAnchor)}
                    onClose={handleClose}
                    PaperProps={{ sx: { width: 220, borderRadius: 0 } }}
                >
                    <MenuItem sx={{ fontSize: '0.85rem' }} onClick={() => handleBranchSelect(t('common.all'))}>{t('common.all')}</MenuItem>
                    <Divider />
                    {shops.map(shop => (
                        <MenuItem key={shop.id} sx={{ fontSize: '0.85rem' }} onClick={() => handleBranchSelect(shop.id)}>
                            {shop.name}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Fade>
    );
};

export default DebtsTab;

