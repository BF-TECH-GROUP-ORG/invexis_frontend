"use client";

import React, { useState, useEffect } from 'react';
import {
    IconButton, Collapse, Fade, Menu, MenuItem, Button, Box, Grid, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, Typography, Divider, Stack, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Warehouse,
    Package,
    ArrowDownRight
} from 'lucide-react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useQuery } from '@tanstack/react-query';
import reportService from '@/services/reportService';
import { getBranches } from '@/services/branches';
import dayjs from 'dayjs';

const InventoryTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;
    const filter = dateRange.filter || 'daily';

    const {
        data: rawReportData,
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-inventory', companyId, startDate, endDate, filter],
        queryFn: () => reportService.getInventoryReport(companyId, { startDate, endDate, filter }),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });

    // Header Selection State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));

    // Menu Anchors
    const [branchAnchor, setBranchAnchor] = useState(null);

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

    // Summary KPIs from data (grandTotal)
    const summary = React.useMemo(() => {
        if (!rawReportData?.data?.grandTotal) return null;
        const gt = rawReportData.data.grandTotal;
        return {
            totalValue: gt.value?.totalValue || 0,
            totalItems: gt.kpis?.totalItems || 0,
            lowStockCount: gt.kpis?.lowStockItems || 0,
            outOfStockCount: gt.kpis?.outOfStock || 0,
            abcCounts: gt.kpis?.abcCounts || { a: 0, b: 0, c: 0 }
        };
    }, [rawReportData]);

    // Transform and group data by date and shop if necessary
    const reportData = React.useMemo(() => {
        if (!rawReportData?.data) return [];
        const { branches, period } = rawReportData.data;
        
        // The backend returns a single snapshot for the period.
        // We'll wrap it in a pseudo-"day" structure to maintain the current table rendering logic
        // but using the period string as the date.
        const periodText = period 
            ? `${dayjs(period.startDate).format('MMM DD')} - ${dayjs(period.endDate).format('MMM DD, YYYY')}`
            : t('common.currentPeriod');

        const filteredBranches = selectedBranch === t('common.all') 
            ? branches 
            : branches.filter(b => b.shopId === selectedBranch);

        return [{
            date: periodText,
            shops: filteredBranches.map(branch => ({
                id: branch.shopId,
                name: getShopName(branch.shopId),
                products: branch.products.map(p => ({
                    id: p.productId,
                    name: p.productName,
                    category: p.categoryName || 'Uncategorized',
                    movement: {
                        open: p.stats.movement.open,
                        in: p.stats.movement.in,
                        out: p.stats.movement.out,
                        close: p.stats.movement.close
                    },
                    value: {
                        unitPrice: p.stats.value.unitPrice,
                        totalValue: p.stats.value.totalValue
                    },
                    status: {
                        reorder: p.stats.status.reorderThreshold,
                        status: p.stats.status.stockStatus,
                        age: p.stats.status.ageDays,
                        abcClass: p.stats.status.abcClass
                    },
                    tracking: {
                        lastRestock: p.stats.tracking.lastRestockDate ? dayjs(p.stats.tracking.lastRestockDate).format('YYYY-MM-DD') : '-',
                        lastMove: p.stats.tracking.lastMoveDate ? dayjs(p.stats.tracking.lastMoveDate).format('YYYY-MM-DD HH:mm') : '-'
                    }
                }))
            }))
        }];
    }, [rawReportData, selectedBranch, t]);

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

    const kpiCards = [
        {
            title: t('inventory.kpis.totalValue'),
            value: formatCurrency(summary?.totalValue || 0),
            icon: TrendingUp,
            color: "#FF6D00",
        },
        {
            title: t('inventory.kpis.totalItems'),
            value: summary?.totalItems || 0,
            icon: Warehouse,
            color: "#0059ffff",
        },
        {
            title: t('inventory.kpis.lowStock'),
            value: summary?.lowStockCount || 0,
            icon: TrendingDown,
            color: "#F59E0B",
            trend: "down",
            trendValue: t('common.actionNeeded'),
        },
        {
            title: t('inventory.kpis.outOfStock'),
            value: summary?.outOfStockCount || 0,
            icon: Package,
            color: "#EF4444",
            trend: "down",
            trendValue: t('common.critical'),
        },
    ];


    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, Date Picker, and Export Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        {t('inventory.title')}
                    </Typography>


                </Box>

                {/* Top KPIs */}


                <div className="w-full py-4">
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {kpiCards.map((card, index) => (
                            <div
                                key={index}
                                style={{ "--hover-color": card.color }}
                                className="
                    group
                    border-2 border-gray-300
                    flex justify-between px-4 py-6
                    rounded-2xl
                    transition-all duration-300 ease-in-out
                    hover:border-(--hover-color)
                "
                            >
                                <div>
                                    <h2 className="text-md text-gray-600 font-semibold">
                                        {card.title}
                                    </h2>
                                    <p className="text-xl font-bold">
                                        {card.value}
                                    </p>
                                </div>

                                <div
                                    className="p-2 rounded-lg w-12 h-12 flex items-center justify-center"
                                    style={{
                                        backgroundColor: `${card.color}20`,
                                        color: card.color
                                    }}
                                >
                                    <card.icon size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>




                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none", "& .MuiPaper-root": { borderRadius: "0px !important" } }}>
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
                                <TableCell align="center">{t('common.product')}</TableCell>
                                <TableCell align="center">{t('common.category')}</TableCell>
                                <TableCell align="center" colSpan={4}>{t('inventory.table.movement')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('inventory.table.value')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('inventory.table.status')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('inventory.table.tracking')}</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={4} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">{t('inventory.table.open')}</TableCell>
                                <TableCell align="center">{t('inventory.table.in')}</TableCell>
                                <TableCell align="center">{t('inventory.table.out')}</TableCell>
                                <TableCell align="center">{t('inventory.table.close')}</TableCell>
                                <TableCell align="center">{t('inventory.table.unitCost')}</TableCell>
                                <TableCell align="center">{t('inventory.table.totalValue')}</TableCell>
                                <TableCell align="center">{t('inventory.table.reorder')}</TableCell>
                                <TableCell align="center">{t('inventory.table.status')}</TableCell>
                                <TableCell align="center">{t('inventory.table.age')}</TableCell>
                                <TableCell align="center">{t('inventory.table.lastRestock')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('inventory.table.lastMove')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((day, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    {/* Date Row */}
                                    <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", py: 1 } }}>
                                        <TableCell sx={{ borderRight: "1px solid #e5e7eb" }}>{day.date}</TableCell>
                                        <TableCell colSpan={14} />
                                    </TableRow>
                                    {day.shops.map((shop, sIdx) => (
                                        <React.Fragment key={sIdx}>
                                            {/* Shop Header Row */}
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{shop.name}</TableCell>
                                                <TableCell colSpan={13} />
                                            </TableRow>
                                            {shop.products.map((product, pIdx) => {
                                                const statusKey = product.status.status === 'Out of Stock' ? 'outOfStock' :
                                                    product.status.status === 'Low Stock' ? 'lowStock' : 'inStock';
                                                const translatedStatus = t(`inventory.status.${statusKey}`);

                                                return (
                                                    <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                        <TableCell />
                                                        <TableCell />
                                                        <TableCell sx={{ pl: 2 }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                                                                {product.name}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">{product.category}</TableCell>
                                                        <TableCell align="center">{product.movement.open}</TableCell>
                                                        <TableCell align="center">{product.movement.in}</TableCell>
                                                        <TableCell align="center">{product.movement.out}</TableCell>
                                                        <TableCell align="center">{product.movement.close}</TableCell>
                                                        <TableCell align="center">{formatCurrency(product.value.unitPrice)}</TableCell>
                                                        <TableCell align="center">{formatCurrency(product.value.totalValue)}</TableCell>
                                                        <TableCell align="center">{product.status.reorder}</TableCell>
                                                        <TableCell align="center">
                                                            <Box component="span" sx={{
                                                                px: 1.5, py: 0.5, borderRadius: "20px",
                                                                bgcolor: product.status.status === 'Out of Stock' ? '#FEF2F2' : product.status.status === 'Low Stock' ? '#FFFBEB' : '#F0FDF4',
                                                                color: product.status.status === 'Out of Stock' ? '#DC2626' : product.status.status === 'Low Stock' ? '#D97706' : '#16A34A',
                                                                fontWeight: '700', fontSize: '0.7rem',
                                                                border: `1px solid ${product.status.status === 'Out of Stock' ? '#FEE2E2' : product.status.status === 'Low Stock' ? '#FEF3C7' : '#DCFCE7'}`
                                                            }}>
                                                                {translatedStatus}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">{product.status.age}</TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                <Typography variant="caption" sx={{ fontWeight: '700', color: product.status.abcClass === 'A' ? '#16A34A' : product.status.abcClass === 'B' ? '#D97706' : '#6B7280' }}>
                                                                    Class {product.status.abcClass}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '0.65rem' }}>{product.tracking.lastRestock}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>{product.tracking.lastMove}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>
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
                    <Divider />
                    {rawReportData?.data?.branches?.map((branch) => (
                        <MenuItem key={branch.shopId} onClick={() => handleBranchSelect(branch.shopId)}>
                            {getShopName(branch.shopId)}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Fade>
    );
};

export default InventoryTab;
