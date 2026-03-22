"use client";

import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Button, ToggleButton, ToggleButtonGroup, Menu, MenuItem, Divider } from '@mui/material';
import ReportKPI from './ReportKPI';
import GroupIcon from '@mui/icons-material/Group';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import analyticsService from '@/services/analyticsService';
import { getWorkersByCompanyId } from '@/services/workersService';
import { getBranches } from '@/services/branches';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const StaffTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;
    const interval = dateRange.filter || 'daily';

    // Fetch Performance Data
    const { data: employeePerformance = [], isLoading: loadingStaff } = useQuery({
        queryKey: ['report-staff-perf', companyId, startDate, endDate, interval],
        queryFn: () => analyticsService.getEmployeePerformance({ startDate, endDate, companyId, interval }),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    const { data: shopPerformance = [], isLoading: loadingShops } = useQuery({
        queryKey: ['report-shop-perf', companyId, startDate, endDate, interval],
        queryFn: () => analyticsService.getShopPerformance({ startDate, endDate, companyId, interval }),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    const { data: workers = [], isLoading: loadingWorkers } = useQuery({
        queryKey: ['report-workers', companyId],
        queryFn: () => getWorkersByCompanyId(companyId),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    const loading = loadingPerf || loadingShop || loadingWorkers;

    const { data: shopsList = [] } = useQuery({
        queryKey: ['shops', companyId],
        queryFn: () => getBranches(companyId),
        enabled: !!companyId,
        staleTime: Infinity,
    });

    const getShopName = (shopId) => {
        if (!shopId || shopId === 'Default') return 'Default';
        const shop = shopsList.find(s => String(s._id || s.id) === String(shopId));
        return shop ? shop.name : shopId;
    };

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
    const [selectedActor, setSelectedActor] = useState(t('common.all'));
    const [branchAnchor, setBranchAnchor] = useState(null);
    const [actorAnchor, setActorAnchor] = useState(null);

    // Merge Data
    const { staffData, branchData } = React.useMemo(() => {
        // Formatted Staff Data
        const formattedStaff = employeePerformance.map(perf => {
            const worker = workers.find(w => w.id === perf.employeeId || w.fullName === perf.employeeName);
            return {
                staffName: perf.employeeName || 'Unknown',
                role: worker?.role || 'Staff',
                branch: worker?.shopId || 'Default',
                transactions: perf.orderCount || 0,
                revenue: parseFloat(perf.totalSales || 0),
                status: worker?.status || 'Active'
            };
        });

        // Filter Staff
        const filteredStaff = formattedStaff.filter(s => {
            const branchMatch = selectedBranch === t('common.all') || s.branch === selectedBranch;
            const actorMatch = selectedActor === t('common.all') || s.staffName === selectedActor;
            return branchMatch && actorMatch;
        });

        // Formatted Branch Data
        const formattedBranch = shopPerformance.map(perf => ({
            branchName: getShopName(perf.shopId) || perf.shopName || 'Default',
            location: 'N/A', // Not available in analytics
            transactions: perf.orderCount || 0,
            revenue: parseFloat(perf.totalRevenue || 0),
            avgTransaction: perf.orderCount > 0 ? Math.round(parseFloat(perf.totalRevenue || 0) / perf.orderCount) : 0,
            staffCount: workers.filter(w => w.shopId === perf.shopId || w.shopName === perf.shopName).length,
            status: 'Performing'
        }));

        return { staffData: filteredStaff, branchData: formattedBranch };
    }, [employeePerformance, shopPerformance, workers, selectedBranch, selectedActor, t]);

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

    const totalRevenue = staffData.reduce((sum, s) => sum + s.revenue, 0);
    const totalTransactions = staffData.reduce((sum, s) => sum + s.transactions, 0);
    const avgPerTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
    const topPerformer = staffData.length > 0 ? staffData.reduce((prev, current) => current.revenue > prev.revenue ? current : prev) : null;

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, and Date Picker */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1.5 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        {t('staff.title')}
                    </Typography>

                </Box>

                {/* Top KPIs */}
                <Typography variant="h6" fontWeight="700" sx={{ color: "#111827", mb: 2 }}>{t('staff.sections.staffMetrics')}</Typography>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <ReportKPI
                        title={t('staff.kpis.totalStaff')}
                        value={staffData.length}
                        icon={GroupIcon}
                        color="#FF6D00"
                        index={0}
                    />
                    <ReportKPI
                        title={t('staff.kpis.activeStaff')}
                        value={staffData.filter(s => s.status === 'Active').length}
                        icon={StarIcon}
                        color="#10B981"
                        index={1}
                    />
                    <ReportKPI
                        title={t('staff.kpis.topStaff')}
                        value={topPerformer?.staffName || t('common.na')}
                        subValue={topPerformer ? formatCurrency(topPerformer.revenue) : ""}
                        icon={TrendingUpIcon}
                        color="#3B82F6"
                        index={2}
                    />
                    <ReportKPI
                        title={t('staff.kpis.lowActivity')}
                        value={staffData.length > 0 ? staffData.reduce((prev, current) => current.transactions < prev.transactions ? current : prev).staffName : t('common.na')}
                        icon={GroupIcon}
                        color="#F59E0B"
                        index={3}
                    />
                </div>

                <Typography variant="h6" fontWeight="700" sx={{ color: "#111827", mb: 2 }}>{t('staff.sections.branchMetrics')}</Typography>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <ReportKPI
                        title={t('staff.kpis.totalBranches')}
                        value={branchData.length}
                        icon={StoreIcon}
                        color="#FF6D00"
                        index={4}
                    />
                    <ReportKPI
                        title={t('staff.kpis.mostActiveBranch')}
                        value={branchData.length > 0 ? branchData.reduce((prev, current) => current.transactions > prev.transactions ? current : prev).branchName : t('common.na')}
                        icon={TrendingUpIcon}
                        color="#10B981"
                        index={5}
                    />
                    <ReportKPI
                        title={t('staff.kpis.highestRevenueBranch')}
                        value={branchData.length > 0 ? branchData.reduce((prev, current) => current.revenue > prev.revenue ? current : prev).branchName : t('common.na')}
                        subValue={branchData.length > 0 ? formatCurrency(branchData.reduce((prev, current) => current.revenue > prev.revenue ? current : prev).revenue) : ""}
                        icon={StarIcon}
                        color="#8B5CF6"
                        index={6}
                    />
                    <ReportKPI
                        title={t('staff.kpis.underperformingBranches')}
                        value={branchData.filter(b => b.transactions < 300).length}
                        icon={GroupIcon}
                        color="#EF4444"
                        index={7}
                    />
                </div>

                {/* Branch Performance Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none", mb: 4 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">{t('staff.table.branchName')}</TableCell>
                                <TableCell align="center">{t('staff.table.location')}</TableCell>
                                <TableCell align="center">{t('common.transactions')}</TableCell>
                                <TableCell align="center">{t('staff.table.revenueFrw')}</TableCell>
                                <TableCell align="center">{t('common.avgTransaction')}</TableCell>
                                <TableCell align="center">{t('staff.table.activeStaff')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('common.status')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {branchData.map((branch, idx) => (
                                <TableRow key={idx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 1 } }}>
                                    <TableCell sx={{ fontWeight: "700", color: "#111827" }}>{branch.branchName}</TableCell>
                                    <TableCell align="center">{branch.location}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{branch.transactions}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600", color: "#10B981" }}>{formatCurrency(branch.revenue)}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{formatCurrency(branch.avgTransaction)}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{branch.staffCount}</TableCell>
                                    <TableCell align="center" sx={{ borderRight: "none" }}>
                                        <Box sx={{ px: 1, py: 0.5, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#10B981", fontWeight: "600", fontSize: "0.75rem" }}>
                                            {branch.status === 'Performing' ? t('staff.status.performing') : branch.status}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Staff Performance Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">{t('staff.table.staffMember')}</TableCell>
                                <TableCell align="center">{t('staff.table.role')}</TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        {t('common.branch')} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{t('common.transactions')}</TableCell>
                                <TableCell align="center">{t('staff.table.revenueFrw')}</TableCell>
                                <TableCell align="center">{t('common.avgTransaction')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('common.status')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staffData.map((staff, idx) => (
                                <TableRow key={idx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 1 } }}>
                                    <TableCell sx={{ fontWeight: "700", color: "#111827" }}>{staff.staffName}</TableCell>
                                    <TableCell align="center">{staff.role}</TableCell>
                                    <TableCell align="center">{staff.branch}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{staff.transactions}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600", color: "#10B981" }}>{formatCurrency(staff.revenue)}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{formatCurrency(Math.round(staff.revenue / staff.transactions))}</TableCell>
                                    <TableCell align="center" sx={{ borderRight: "none" }}>
                                        <Box sx={{ px: 1, py: 0.5, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#10B981", fontWeight: "600", fontSize: "0.75rem" }}>
                                            {staff.status === 'Active' ? t('staff.status.active') : staff.status}
                                        </Box>
                                    </TableCell>
                                </TableRow>
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
                    <MenuItem onClick={() => handleActorSelect('Jean Pierre')}>Jean Pierre</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Sarah Smith')}>Sarah Smith</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Emmanuel R.')}>Emmanuel R.</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Marie Claire')}>Marie Claire</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Alice')}>Alice</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Bob')}>Bob</MenuItem>
                </Menu>
            </Box>
        </Fade>
    );
};

export default StaffTab;
