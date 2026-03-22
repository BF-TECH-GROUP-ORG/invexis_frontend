"use client";

import React, { useState, useEffect } from 'react';
import { Fade, Menu, MenuItem, Box, Grid, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Divider, Button, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import salesService from '@/services/salesService';
import ReportKPI from './ReportKPI';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const SalesTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
    const [filterByKPI, setFilterByKPI] = useState(null);
    const [selectedActor, setSelectedActor] = useState(t('common.all'));
    const [branchAnchor, setBranchAnchor] = useState(null);
    const [actorAnchor, setActorAnchor] = useState(null);

    const {
        data: rawSales = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-sales', companyId, startDate, endDate, selectedBranch, selectedActor],
        queryFn: () => salesService.getSalesHistory(companyId, { 
            shopId: selectedBranch === t('common.all') ? undefined : selectedBranch,
            soldBy: selectedActor === t('common.all') ? undefined : selectedActor,
            startDate, 
            endDate 
        }),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    // Process stats and report data structure
    const { stats, reportData } = React.useMemo(() => {
        let sales = Array.isArray(rawSales) ? rawSales : [];

        // Group by date for the hierarchical table
        const groupedByDate = {};
        let totalRevenue = 0;
        let totalTransactions = sales.length;
        let productSales = {};

        sales.forEach(sale => {
            const dateStr = dayjs(sale.createdAt).format('MM/DD/YYYY');
            if (!groupedByDate[dateStr]) groupedByDate[dateStr] = { date: dateStr, shops: {} };
            
            const shopName = sale.shopId || 'Default';
            if (!groupedByDate[dateStr].shops[shopName]) groupedByDate[dateStr].shops[shopName] = { name: shopName, sales: [] };
            
            // Map backend sale structure to UI sale structure if needed
            const uiSale = {
                invoiceNo: sale.invoiceNo || sale.id?.slice(-8).toUpperCase(),
                productName: sale.items?.[0]?.productName || 'Multiple Items',
                quantity: { 
                    sold: sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
                    returns: 0, 
                    net: sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0 
                },
                value: { 
                    unitPrice: sale.items?.[0]?.unitPrice || 0,
                    totalAmount: sale.totalAmount || 0 
                },
                customer: { name: sale.customerName || 'Walk-in', type: 'Retail' },
                tracking: { saleTime: dayjs(sale.createdAt).format('hh:mm A'), soldBy: sale.soldBy || 'System' }
            };

            groupedByDate[dateStr].shops[shopName].sales.push(uiSale);
            totalRevenue += sale.totalAmount || 0;
            
            sale.items?.forEach(item => {
                if (!productSales[item.productName]) productSales[item.productName] = 0;
                productSales[item.productName] += item.quantity;
            });
        });

        const reportDataFormatted = Object.values(groupedByDate).map(day => ({
            ...day,
            shops: Object.values(day.shops)
        }));

        let topProduct = 'N/A';
        let topProductQty = 0;
        Object.entries(productSales).forEach(([product, qty]) => {
            if (qty > topProductQty) {
                topProductQty = qty;
                topProduct = product;
            }
        });

        // Simplified stats calculation
        const mockStats = {
            totalRevenue: totalRevenue,
            totalTransactions: totalTransactions,
            averageOrderValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
            topProduct: topProduct,
            topProductQuantity: topProductQty,
            growthPercent: 0, // Would need historical comparison data
            previousPeriodRevenue: 0
        };

        return { stats: mockStats, reportData: reportDataFormatted };
    }, [rawSales]);

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


    const handleKPIClick = (kpiName) => {
        setFilterByKPI(filterByKPI === kpiName ? null : kpiName);
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title and Toggle */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1.5 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        {t('sales.title')}
                    </Typography>

                </Box>

                {/* Top 5 KPIs */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div onClick={() => handleKPIClick('revenue')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                        <ReportKPI
                            title={t('sales.kpis.revenue')}
                            value={formatCurrency(stats?.totalRevenue || 0)}
                            icon={AttachMoneyIcon}
                            color="#FF6D00"
                            trend={stats?.growthPercent >= 0 ? "up" : "down"}
                            trendValue={`${stats?.growthPercent}%`}
                            index={0}
                        />
                    </div>

                    <div onClick={() => handleKPIClick('transactions')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                        <ReportKPI
                            title={t('sales.kpis.transactions')}
                            value={stats?.totalTransactions || 0}
                            icon={ShoppingCartIcon}
                            color="#3B82F6"
                            index={1}
                        />
                    </div>

                    <div onClick={() => handleKPIClick('avgValue')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                        <ReportKPI
                            title={t('sales.kpis.avgValue')}
                            value={formatCurrency(stats?.averageOrderValue || 0)}
                            icon={ReceiptLongIcon}
                            color="#8B5CF6"
                            index={2}
                        />
                    </div>

                    <div onClick={() => handleKPIClick('topProduct')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                        <ReportKPI
                            title={t('sales.kpis.topProduct')}
                            value={`${stats?.topProduct} (${stats?.topProductQuantity} ${t('common.units')})`}
                            icon={EmojiEventsIcon}
                            color="#F59E0B"
                            index={3}
                        />
                    </div>

                    <div onClick={() => handleKPIClick('growth')} className="cursor-pointer hover:scale-[1.02] transition-transform">
                        <ReportKPI
                            title={t('sales.kpis.growth')}
                            value={`${stats?.growthPercent}%`}
                            icon={WhatshotIcon}
                            color={stats?.growthPercent >= 0 ? "#10B981" : "#EF4444"}
                            trend={stats?.growthPercent >= 0 ? "up" : "down"}
                            index={4}
                        />
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
                                        {selectedBranch === t('common.all') ? t('common.branch') : selectedBranch} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleActorClick}>
                                        {selectedActor === t('common.all') ? t('common.soldBy') : selectedActor} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{t('common.invoiceNo')}</TableCell>
                                <TableCell align="center">{t('common.product')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('sales.table.quantity')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('sales.table.value')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('sales.table.customer')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('common.tracking')}</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={5} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">{t('sales.table.qtySold')}</TableCell>
                                <TableCell align="center">{t('common.returns')}</TableCell>
                                <TableCell align="center">{t('sales.table.netQty')}</TableCell>
                                <TableCell align="center">{t('common.unitPrice')}</TableCell>
                                <TableCell align="center">{t('common.totalAmount')}</TableCell>
                                <TableCell align="center">{t('common.customer')}</TableCell>
                                <TableCell align="center">{t('common.type')}</TableCell>
                                <TableCell align="center">{t('sales.table.saleTime')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('common.soldBy')}</TableCell>
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
                                    {day.shops.map((shop, sIdx) => (
                                        <React.Fragment key={sIdx}>
                                            {/* Shop Header Row */}
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{shop.name}</TableCell>
                                                <TableCell colSpan={11} />
                                            </TableRow>
                                            {shop.sales.map((sale, pIdx) => (
                                                <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                    <TableCell />
                                                    <TableCell />
                                                    <TableCell />
                                                    <TableCell align="center">{sale.invoiceNo}</TableCell>
                                                    <TableCell sx={{ pl: 2 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                                                            {sale.productName}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">{sale.quantity.sold}</TableCell>
                                                    <TableCell align="center">{sale.quantity.returns}</TableCell>
                                                    <TableCell align="center">{sale.quantity.net}</TableCell>
                                                    <TableCell align="center">{formatCurrency(sale.value.unitPrice)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(sale.value.totalAmount)}</TableCell>
                                                    <TableCell align="center">{sale.customer.name}</TableCell>
                                                    <TableCell align="center">{sale.customer.type}</TableCell>
                                                    <TableCell align="center">{sale.tracking.saleTime}</TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "none" }}>{sale.tracking.soldBy}</TableCell>
                                                </TableRow>
                                            ))}
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
                    <MenuItem onClick={() => handleActorSelect('David')}>David</MenuItem>
                </Menu>
            </Box>
        </Fade>
    );
};

export default SalesTab;
