"use client";

import React, { useState } from 'react';
import { Fade, Menu, MenuItem, Box, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/Download';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import reportService from '@/services/reportService';
import { getBranches } from '@/services/branches';
import ReportKPI from './ReportKPI';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import dayjs from 'dayjs';

const SalesTab = ({ dateRange }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;
    const filter = dateRange.filter || 'daily';

    // Filtering State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));
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

    const {
        data: rawReportData,
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-sales-hierarchical', companyId, startDate, endDate, filter],
        queryFn: () => reportService.getSalesReport(companyId, { startDate, endDate, filter }),
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });

    // Summary KPIs from data (grandTotal)
    const summary = React.useMemo(() => {
        if (!rawReportData?.data?.grandTotal) return null;
        const gt = rawReportData.data.grandTotal;
        return {
            totalRevenue: gt.revenue?.totalValue || 0,
            totalTransactions: gt.transactions?.count || 0,
            totalUnits: gt.units?.count || 0,
            averageValue: gt.kpis?.averageValue || 0,
            topProduct: gt.kpis?.topProduct?.name || 'N/A',
            topProductQty: gt.kpis?.topProduct?.units || 0,
            growth: gt.kpis?.growth || 0
        };
    }, [rawReportData]);

    // Transform and filter data
    const reportData = React.useMemo(() => {
        if (!rawReportData?.data) return [];
        const { branches, period } = rawReportData.data;
        
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
                totals: branch.totals,
                sales: branch.sales.map(sale => ({
                    id: sale.saleId,
                    invoiceNo: sale.invoiceNo,
                    invoiceUrl: sale.invoiceUrl,
                    time: dayjs(sale.createdAt).format('hh:mm A'),
                    soldBy: sale.soldBy,
                    totalValue: sale.totalValue,
                    status: sale.status,
                    items: sale.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        category: item.category || 'Uncategorized',
                        quantity: item.quantity,
                        value: item.value
                    }))
                }))
            }))
        }];
    }, [rawReportData, selectedBranch, shops, t]);

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
            title: t('sales.kpis.revenue'),
            value: formatCurrency(summary?.totalRevenue || 0),
            icon: AttachMoneyIcon,
            color: "#FF6D00",
            trend: (summary?.growth || 0) >= 0 ? "up" : "down",
            trendValue: `${summary?.growth || 0}%`,
        },
        {
            title: t('sales.kpis.transactions'),
            value: summary?.totalTransactions || 0,
            icon: ShoppingCartIcon,
            color: "#3B82F6",
        },
        {
            title: t('sales.kpis.avgValue'),
            value: formatCurrency(summary?.averageValue || 0),
            icon: ReceiptLongIcon,
            color: "#8B5CF6",
        },
        {
            title: t('sales.kpis.topProduct'),
            value: `${summary?.topProduct} (${summary?.topProductQty} ${t('common.units')})`,
            icon: EmojiEventsIcon,
            color: "#F59E0B",
        },
        {
            title: t('sales.kpis.growth'),
            value: `${summary?.growth || 0}%`,
            icon: WhatshotIcon,
            color: (summary?.growth || 0) >= 0 ? "#10B981" : "#EF4444",
            trend: (summary?.growth || 0) >= 0 ? "up" : "down",
        },
    ];

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="700" sx={{ color: "#111827" }}>
                        {t('sales.title')}
                    </Typography>
                </Box>

                {/* KPI Cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {kpiCards.map((card, index) => (
                        <ReportKPI
                            key={index}
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                            trend={card.trend}
                            trendValue={card.trendValue}
                            index={index}
                        />
                    ))}
                </div>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 0, overflowX: 'auto', boxShadow: "none" }}>
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
                                <TableCell align="center">{t('common.invoiceNo')}</TableCell>
                                <TableCell align="center">{t('common.product')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('sales.table.quantity')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('sales.table.value')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('common.tracking')}</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={4} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">{t('sales.table.qtySold')}</TableCell>
                                <TableCell align="center">{t('common.returns')}</TableCell>
                                <TableCell align="center">{t('sales.table.netQty')}</TableCell>
                                <TableCell align="center">{t('common.unitPrice')}</TableCell>
                                <TableCell align="center">{t('common.totalAmount')}</TableCell>
                                <TableCell align="center">{t('sales.table.saleTime')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('common.soldBy')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((day, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    <TableRow sx={{ bgcolor: "#f3f4f6", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", py: 1 } }}>
                                        <TableCell sx={{ borderRight: "1px solid #e5e7eb" }}>{day.date}</TableCell>
                                        <TableCell colSpan={10} />
                                    </TableRow>
                                    {day.shops.map((shop, sIdx) => (
                                        <React.Fragment key={sIdx}>
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{shop.name}</TableCell>
                                                <TableCell colSpan={9} />
                                            </TableRow>
                                            {shop.sales.map((sale) => (
                                                <React.Fragment key={sale.id}>
                                                    {sale.items.map((item, iIdx) => (
                                                        <TableRow key={`${sale.id}-${iIdx}`} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                            <TableCell />
                                                            <TableCell />
                                                            <TableCell align="center">
                                                                {iIdx === 0 && (
                                                                    sale.invoiceUrl ? (
                                                                        <Link 
                                                                            href={sale.invoiceUrl} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            download
                                                                            sx={{ 
                                                                                display: 'flex', 
                                                                                alignItems: 'center', 
                                                                                justifyContent: 'center',
                                                                                gap: 0.5,
                                                                                textDecoration: 'none',
                                                                                color: '#FF6D00',
                                                                                fontWeight: '700',
                                                                                '&:hover': { textDecoration: 'underline' }
                                                                            }}
                                                                        >
                                                                            <DownloadIcon sx={{ fontSize: 16 }} />
                                                                            {t('common.invoice')}
                                                                        </Link>
                                                                    ) : sale.invoiceNo
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ pl: 2 }}>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                                                                    {item.productName}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center">{item.quantity.sold}</TableCell>
                                                            <TableCell align="center">{item.quantity.returns}</TableCell>
                                                            <TableCell align="center">{item.quantity.net}</TableCell>
                                                            <TableCell align="center">{formatCurrency(item.value.unitPrice)}</TableCell>
                                                            <TableCell align="center">{formatCurrency(item.value.totalAmount)}</TableCell>
                                                            <TableCell align="center">{sale.time}</TableCell>
                                                            <TableCell align="center" sx={{ borderRight: "none" }}>{sale.soldBy}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                            {/* Shop Subtotal Row */}
                                            <TableRow sx={{ bgcolor: "#e9824bff", "& td": { color: "white", fontWeight: "700", fontSize: "0.80rem", py: 0.8, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                                <TableCell colSpan={2} sx={{ pl: 2 }}>{t('common.subtotal', { name: shop.name })}</TableCell>
                                                <TableCell align="center">-</TableCell>
                                                <TableCell align="center">{shop.totals?.transactions || 0} {t('sales.kpis.transactions')}</TableCell>
                                                <TableCell align="center" colSpan={3}>{shop.totals?.units || 0} {t('common.units')}</TableCell>
                                                <TableCell align="center" colSpan={2}>{formatCurrency(shop.totals?.revenue || 0)}</TableCell>
                                                <TableCell colSpan={2} />
                                            </TableRow>
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                            
                            {/* Spacer Row before Grand Total */}
                            <TableRow sx={{ height: 16 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>

                            {/* Grand Total Row */}
                            <TableRow sx={{ bgcolor: "#3b2005ff", "& td": { color: "white", fontWeight: "800", fontSize: "0.85rem", py: 1.2, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                <TableCell colSpan={2} sx={{ pl: 2 }}>{t('common.total')}</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">{summary?.totalTransactions || 0} {t('sales.kpis.transactions')}</TableCell>
                                <TableCell align="center" colSpan={3}>{summary?.totalUnits || 0} {t('common.units')}</TableCell>
                                <TableCell align="center" colSpan={2}>{formatCurrency(summary?.totalRevenue || 0)}</TableCell>
                                <TableCell colSpan={2} />
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
            </Box>
        </Fade>
    );
};

export default SalesTab;
