"use client";

import React, { useState, useEffect } from 'react';
import {
    Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table,
    TableHead, TableBody, TableCell, TableRow, Menu, MenuItem, Divider, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import ReportKPI from './ReportKPI';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import debtsService from '@/services/debts';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DebtsTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
    const [branchAnchor, setBranchAnchor] = useState(null);

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;

    const {
        data: rawDebts = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-debts', companyId, startDate, endDate, selectedBranch],
        queryFn: () => debtsService.getDebts(companyId, { 
            shopId: selectedBranch === t('common.all') ? undefined : selectedBranch 
        }),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    // Process KPIs and report data structure
    const { kpis, reportData } = React.useMemo(() => {
        let debts = Array.isArray(rawDebts) ? rawDebts : [];
        
        let total = 0, overdue = 0, uniqueDebtors = new Set(), totalAge = 0, debtCount = 0;
        const groupedByDate = {};

        debts.forEach(debt => {
            const balance = debt.balance || (debt.totalAmount - (debt.amountPaid || 0));
            total += balance;
            debtCount++;
            if (debt.customerPhone) uniqueDebtors.add(debt.customerPhone);
            
            const createdAt = dayjs(debt.createdAt);
            const age = dayjs().diff(createdAt, 'day');
            totalAge += age;
            
            const isOverdue = debt.dueDate && dayjs().isAfter(dayjs(debt.dueDate));
            if (isOverdue) overdue += balance;

            const dateStr = createdAt.format('MM/DD/YYYY');
            if (!groupedByDate[dateStr]) groupedByDate[dateStr] = { date: dateStr, branches: {} };
            
            const branchName = debt.shopId || 'Default';
            if (!groupedByDate[dateStr].branches[branchName]) groupedByDate[dateStr].branches[branchName] = { name: branchName, debts: [] };
            
            groupedByDate[dateStr].branches[branchName].debts.push({
                invoiceNo: debt.invoiceNo || debt.id?.slice(-8).toUpperCase(),
                customer: { name: debt.customerName || 'Customer', phone: debt.customerPhone || '-' },
                original: debt.totalAmount || 0,
                paid: debt.amountPaid || 0,
                balance: balance,
                lastPaid: debt.lastPaymentDate ? dayjs(debt.lastPaymentDate).format('MM/DD/YYYY') : '-',
                dueDate: debt.dueDate ? dayjs(debt.dueDate).format('MM/DD/YYYY') : '-',
                age: age,
                status: isOverdue ? 'Overdue' : 'Pending',
                saleDate: createdAt.format('MM/DD/YYYY'),
                recordedBy: debt.createdBy || 'System'
            });
        });

        const reportDataFormatted = Object.values(groupedByDate).map(day => ({
            ...day,
            branches: Object.values(day.branches)
        }));

        return {
            kpis: {
                totalOutstanding: total,
                overdueAmount: overdue,
                debtorsCount: uniqueDebtors.size,
                avgDebtAge: debtCount > 0 ? Math.round(totalAge / debtCount) : 0
            },
            reportData: reportDataFormatted
        };
    }, [rawDebts, t]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => `${val.toLocaleString()} FRW`;

    const handleBranchClick = (event) => setBranchAnchor(event.currentTarget);
    const handleClose = () => { setBranchAnchor(null); };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        handleClose();
    };


    const getStatusColor = (status) => {
        if (status === 'Overdue') return { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' };
        return { color: '#10B981', bg: '#F0FDF4', border: '#DCFCE7' };
    };

    const getTranslatedStatus = (status) => {
        if (status === 'Overdue') return t('debts.status.overdue');
        if (status === 'Pending') return t('debts.status.pending');
        return status;
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, Date Picker, and Export Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        {t('debts.title')}
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
                        title={t('debts.kpis.totalOutstanding')}
                        value={(() => {
                            const val = kpis?.totalOutstanding || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.totalOutstanding || 0)}
                        icon={AccountBalanceIcon}
                        color="#FF6D00"
                        index={0}
                    />
                    <ReportKPI
                        title={t('debts.kpis.overdueAmount')}
                        value={(() => {
                            const val = kpis?.overdueAmount || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.overdueAmount || 0)}
                        icon={WarningIcon}
                        color="#EF4444"
                        index={1}
                    />
                    <ReportKPI
                        title={t('debts.kpis.activeDebtors')}
                        value={kpis?.debtorsCount || 0}
                        icon={PeopleIcon}
                        color="#3B82F6"
                        index={2}
                    />
                    <ReportKPI
                        title={t('debts.kpis.avgDebtAge')}
                        value={`${kpis?.avgDebtAge || 0} ${t('common.days')}`}
                        icon={TimerIcon}
                        color="#8B5CF6"
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
                                <TableCell align="center">{t('debts.table.invoiceNo')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('debts.table.customerInfo')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('debts.table.debtAmount')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('debts.table.paymentInfo')}</TableCell>
                                <TableCell align="center">{t('debts.table.status')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('debts.table.tracking')}</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={3} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">{t('debts.table.name')}</TableCell>
                                <TableCell align="center">{t('debts.table.phone')}</TableCell>
                                <TableCell align="center">{t('debts.table.original')}</TableCell>
                                <TableCell align="center">{t('debts.table.paid')}</TableCell>
                                <TableCell align="center">{t('debts.table.balance')}</TableCell>
                                <TableCell align="center">{t('debts.table.lastPaid')}</TableCell>
                                <TableCell align="center">{t('debts.table.dueDate')}</TableCell>
                                <TableCell align="center">{t('debts.table.age')}</TableCell>
                                <TableCell align="center">{t('debts.table.saleDate')}</TableCell>
                                <TableCell align="center">{t('common.recordedBy')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>-</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((day, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    {/* Date Row */}
                                    <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", py: 1 } }}>
                                        <TableCell sx={{ borderRight: "1px solid #e5e7eb" }}>{day.date}</TableCell>
                                        <TableCell colSpan={12} />
                                    </TableRow>
                                    {day.branches.map((branch, bIdx) => (
                                        <React.Fragment key={bIdx}>
                                            {/* Branch Header Row */}
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{branch.name}</TableCell>
                                                <TableCell colSpan={11} />
                                            </TableRow>
                                            {branch.debts.map((debt, pIdx) => {
                                                const statusColor = getStatusColor(debt.status);
                                                return (
                                                    <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                        <TableCell />
                                                        <TableCell />
                                                        <TableCell align="center" sx={{ fontWeight: "600" }}>{debt.invoiceNo}</TableCell>
                                                        <TableCell sx={{ pl: 2, fontWeight: "600" }}>{debt.customer.name}</TableCell>
                                                        <TableCell align="center">{debt.customer.phone}</TableCell>
                                                        <TableCell align="center">{formatCurrency(debt.original)}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#10B981", fontWeight: "600" }}>{formatCurrency(debt.paid)}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#EF4444", fontWeight: "700" }}>{formatCurrency(debt.balance)}</TableCell>
                                                        <TableCell align="center">{debt.lastPaid}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#D97706", fontWeight: "600" }}>{debt.dueDate}</TableCell>
                                                        <TableCell align="center">{debt.age}</TableCell>
                                                        <TableCell align="center">{debt.saleDate}</TableCell>
                                                        <TableCell align="center">{debt.recordedBy}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>
                                                            <Box sx={{
                                                                px: 1, py: 0.3, borderRadius: "12px",
                                                                bgcolor: statusColor.bg,
                                                                color: statusColor.color,
                                                                fontWeight: '700', fontSize: '0.65rem',
                                                                border: `1px solid ${statusColor.border}`
                                                            }}>
                                                                {getTranslatedStatus(debt.status)}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={14} sx={{ border: "none" }} /></TableRow>
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
            </Box>
        </Fade>
    );
};

export default DebtsTab;
