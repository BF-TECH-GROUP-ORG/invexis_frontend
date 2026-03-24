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

    const period = rawReportData?.data?.period;
    const isAllTime = !period?.startDate || dayjs(period.startDate).year() < 2000;

    // Transform and map data
    const { summary, reportData } = React.useMemo(() => {
        if (!rawReportData?.data) return { summary: null, reportData: [] };
        const { branches } = rawReportData.data;
        
        const periodText = isAllTime
            ? t('controls.allTime') || 'All Time'
            : `${dayjs(period.startDate).format('MMM DD')} - ${dayjs(period.endDate).format('MMM DD, YYYY')}`;

        const filteredBranches = selectedBranch === t('common.all') 
            ? branches 
            : branches.filter(b => b.shopId === selectedBranch);

        let grandRevenue = 0;
        let grandTransactions = 0;
        let grandUnits = 0;
        let topProductMap = {};

        const processedShops = filteredBranches.map(branch => {
            let branchRevenue = 0;
            let branchUnits = 0;
            let branchTransactions = branch.sales.length;

            const mappedSales = branch.sales.map(sale => {
                let saleValue = 0;
                const mappedItems = sale.items.map(item => {
                    const qty = item.quantity?.net || 0;
                    const val = item.value?.totalAmount || 0;
                    
                    branchUnits += qty;
                    saleValue += val;

                    // Track top product
                    if (item.productName) {
                        topProductMap[item.productName] = (topProductMap[item.productName] || 0) + qty;
                    }

                    return {
                        productId: item.productId,
                        productName: item.productName,
                        category: item.category || 'Uncategorized',
                        quantity: item.quantity,
                        value: item.value
                    };
                });

                branchRevenue += saleValue;

                return {
                    id: sale.saleId,
                    invoiceNo: sale.invoiceNo,
                    invoiceUrl: sale.invoiceUrl,
                    time: dayjs(sale.createdAt).format('hh:mm A'),
                    soldBy: sale.soldBy,
                    totalValue: saleValue,
                    status: sale.status,
                    paymentStatus: sale.paymentStatus,
                    items: mappedItems
                };
            });

            grandRevenue += branchRevenue;
            grandTransactions += branchTransactions;
            grandUnits += branchUnits;

            return {
                id: branch.shopId,
                name: getShopName(branch.shopId),
                totals: {
                    revenue: branchRevenue,
                    transactions: branchTransactions,
                    units: branchUnits
                },
                sales: mappedSales
            };
        });

        // Find top product
        let topProduct = 'N/A';
        let topProductQty = 0;
        Object.entries(topProductMap).forEach(([name, qty]) => {
            if (qty > topProductQty) {
                topProductQty = qty;
                topProduct = name;
            }
        });

        const gt = rawReportData.data.grandTotal || {};
        const growth = gt.kpis?.growth || 0;

        return {
            summary: {
                totalRevenue: grandRevenue,
                totalTransactions: grandTransactions,
                totalUnits: grandUnits,
                averageValue: grandTransactions > 0 ? (grandRevenue / grandTransactions) : 0,
                topProduct,
                topProductQty,
                growth
            },
            reportData: [{
                date: periodText,
                shops: processedShops
            }]
        };
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
    
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' };
            case 'debt': return { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' };
            case 'unpaid': return { bg: '#FFF3E0', text: '#EF6C00', border: '#FFE0B2' };
            case 'pending': return { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' };
            case 'failed': return { bg: '#ECEFF1', text: '#455A64', border: '#CFD8DC' };
            case 'refunded': return { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' };
            // Sale Statuses
            case 'completed': return { bg: '#E0F2F1', text: '#00695C', border: '#B2DFDB' };
            case 'validated': return { bg: '#F3E5F5', text: '#6A1B9A', border: '#E1BEE7' };
            case 'processing': return { bg: '#FFFDE7', text: '#F9A825', border: '#FFF9C4' };
            case 'canceled': return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' };
            default: return { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' };
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = getStatusColor(status);
        return (
            <Box sx={{ 
                display: 'inline-block', 
                px: 1, 
                py: 0.25, 
                borderRadius: '4px', 
                fontSize: '0.65rem', 
                fontWeight: '700', 
                backgroundColor: colors.bg, 
                color: colors.text,
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase'
            }}>
                {status || 'Unknown'}
            </Box>
        );
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
                <TableContainer component={Paper} elevation={0} sx={{ 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "0px !important", 
                    overflowX: 'auto', 
                    boxShadow: "none",
                    "& .MuiPaper-root": { borderRadius: "0px !important" }
                }}>
                    <Table size="small">
                        <TableHead>
                            {/* Main Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">
                                    {isAllTime ? (
                                        t('controls.allTime') || 'All Time'
                                    ) : dateRange.startDate ? (
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
                                <TableCell align="center">{t('common.invoice')}</TableCell>
                                <TableCell align="center">{t('common.product')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('sales.table.quantity')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('sales.table.value')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('common.tracking')}</TableCell>
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
                                <TableCell align="center">{t('common.status')}</TableCell>
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
                                                                            style={{ 
                                                                                display: 'flex', 
                                                                                alignItems: 'center', 
                                                                                justifyContent: 'center',
                                                                                gap: '4px',
                                                                                textDecoration: 'none',
                                                                                color: '#FF6D00',
                                                                                fontWeight: '700'
                                                                            }}
                                                                        >
                                                                            <DownloadIcon style={{ fontSize: '16px', marginRight: '4px' }} />
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
                                                            <TableCell align="center">
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                                                                    <StatusBadge status={sale.status} />
                                                                    {sale.paymentStatus && sale.paymentStatus.toLowerCase() !== 'paid' && (
                                                                        <StatusBadge status={sale.paymentStatus} />
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ borderRight: "none" }}>{sale.soldBy}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                            {/* Shop Subtotal Row */}
                                            <TableRow sx={{ bgcolor: "#FFF7ED", "& td": { color: "#9A3412", fontWeight: "700", fontSize: "0.80rem", py: 1, borderBottom: "2px solid #FED7AA" } }}>
                                                <TableCell colSpan={2} sx={{ pl: 2, borderRight: "none" }}>{t('common.subtotal', { name: shop.name })}</TableCell>
                                                <TableCell align="center" sx={{ borderRight: "none" }}>-</TableCell>
                                                <TableCell align="center" sx={{ borderRight: "none" }}>{shop.totals?.transactions || 0} {t('sales.kpis.transactions')}</TableCell>
                                                <TableCell align="center" colSpan={3} sx={{ borderRight: "none", bgcolor: "#FFEDD5" }}>{shop.totals?.units || 0} {t('common.units')}</TableCell>
                                                <TableCell align="center" colSpan={2} sx={{ borderRight: "none", bgcolor: "#FDBA74", color: "#7C2D12" }}>{formatCurrency(shop.totals?.revenue || 0)}</TableCell>
                                                <TableCell colSpan={3} />
                                            </TableRow>
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                            
                            {/* Spacer Row before Grand Total */}
                            <TableRow sx={{ height: 16 }}><TableCell colSpan={11} sx={{ border: "none" }} /></TableRow>

                            {/* Grand Total Row */}
                            <TableRow sx={{ bgcolor: "#111827", "& td": { color: "white", fontWeight: "800", fontSize: "0.85rem", py: 1.5, borderRight: "1px solid rgba(255,255,255,0.1)" } }}>
                                <TableCell colSpan={2} sx={{ pl: 2, borderRight: "1px solid rgba(255,255,255,0.2)" }}>{t('common.total')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>-</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{summary?.totalTransactions || 0} {t('sales.kpis.transactions')}</TableCell>
                                <TableCell align="center" colSpan={3} sx={{ borderRight: "1px solid rgba(255,255,255,0.2)", bgcolor: "#1F2937" }}>{summary?.totalUnits || 0} {t('common.units')}</TableCell>
                                <TableCell align="center" colSpan={2} sx={{ borderRight: "1px solid rgba(255,255,255,0.2)", bgcolor: "#FF6D00" }}>{formatCurrency(summary?.totalRevenue || 0)}</TableCell>
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
            </Box>
        </Fade>
    );
};

export default SalesTab;
