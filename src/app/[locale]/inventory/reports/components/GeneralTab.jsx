import React, { useState, useEffect } from 'react';
import {
    IconButton, Collapse, Fade, Menu, MenuItem, Button, Box, Grid, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, Typography, Divider, Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
import { useTranslations } from "next-intl";
import { useQuery } from '@tanstack/react-query';
import reportService from '@/services/reportService';
import { getBranches } from '@/services/branches';
import dayjs from 'dayjs';

const GeneralTab = ({ dateRange, reportView }) => {
    const t = useTranslations("reports");
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;
    const filter = dateRange.filter || 'daily';

    const {
        data: reportData,
        isLoading: loadingReport,
        error
    } = useQuery({
        queryKey: ['report-general', companyId, startDate, endDate, filter],
        queryFn: () => reportService.getGeneralReport(companyId, { startDate, endDate, filter }),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    // Fetch shops for name mapping
    const { data: shops = [], isLoading: loadingShops } = useQuery({
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

    const loading = loadingReport || loadingShops;

    // Header Selection State
    const [selectedBranch, setSelectedBranch] = useState(t('common.all'));

    // Menu Anchors
    const [branchAnchor, setBranchAnchor] = useState(null);

    // Extract branch names for filtering
    const branches = React.useMemo(() => {
        if (!reportData?.branches) return [];
        return reportData.branches
            .filter(b => b.shopId)
            .map(b => b.shopId);
    }, [reportData]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return "0";
        return `${val.toLocaleString()}`;
    };

    const handleBranchClick = (event) => setBranchAnchor(event.currentTarget);
    const handleClose = () => { setBranchAnchor(null); };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        handleClose();
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb", p: 0 }}>
                <Typography variant="h5" align="left" fontWeight="700" sx={{ mb: 2, mt: 2, color: "#111827" }}>
                    {t('general.title')}
                </Typography>

                {/* Top KPIs */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 py-4 ">
                    {[
                        { title: t('general.kpis.revenue'), value: formatCurrency(reportData?.grandTotal?.sales?.gross || 0), Icon: DollarSign, color: "#3b82f6", bgColor: "#eff6ff" },
                        { title: t('general.kpis.costs'), value: formatCurrency(reportData?.grandTotal?.financials?.cost || 0), Icon: BarChart3, color: "#f59e0b", bgColor: "#fef3c7" },
                        { title: t('general.kpis.profit'), value: formatCurrency(reportData?.grandTotal?.financials?.profit || 0), Icon: TrendingUp, color: "#10b981", bgColor: "#ecfdf5" },
                        { title: t('general.kpis.debts'), value: formatCurrency(reportData?.grandTotal?.debt?.balance || 0), Icon: CreditCard, color: "#ef4444", bgColor: "#fee2e2" },
                        // { title: t('general.kpis.returns'), value: formatCurrency(reportData?.grandTotal?.sales?.discounts || 0), Icon: RefreshCw, color: "#8b5cf6", bgColor: "#f3e8ff" }
                    ].map((kpi, i) => (
                        <div key={i} className="h-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{ height: "100%" }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: 0,
                                        bgcolor: "white",
                                        transition: "all 0.3s ease",
                                        boxShadow: "none",
                                        "&:hover": {
                                            borderColor: kpi.color,
                                            transform: "translateY(-4px)",
                                            boxShadow: "none"
                                        }
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            fontWeight="600"
                                            color="text.secondary"
                                            sx={{
                                                display: "block",
                                                mb: 0.5,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}
                                        >
                                            {kpi.title}
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight="800"
                                            sx={{ color: "#111827" }}
                                        >
                                            {kpi.value}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: "12px",
                                            bgcolor: kpi.bgColor,
                                            color: kpi.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <kpi.Icon size={24} />
                                    </Box>
                                </Paper>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none", "& .MuiPaper-root": { borderRadius: "0px !important" } }}>
                    <Table size="small">
                        <TableHead>
                            {/* Main Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">
                                    {!reportData?.period?.startDate || dayjs(reportData.period.startDate).year() < 2000 ? (
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
                                <TableCell align="center">{t('common.product')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('general.table.inventory')}</TableCell>
                                <TableCell align="center" colSpan={3}>{t('general.table.sales')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('general.table.payments')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('general.table.debts')}</TableCell>
                                <TableCell align="center">{t('general.table.cost')}</TableCell>
                                <TableCell align="center" colSpan={2}>{t('general.table.profit')}</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={3} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">{t('general.table.initialStock')}</TableCell>
                                <TableCell align="center">{t('general.table.remaining')}</TableCell>
                                <TableCell align="center">{t('general.table.stockValue')}</TableCell>
                                <TableCell align="center">{t('general.table.grossSales')}</TableCell>
                                <TableCell align="center">{t('general.table.discounts')}</TableCell>
                                <TableCell align="center">{t('general.table.netSales')}</TableCell>
                                <TableCell align="center">{t('general.table.received')}</TableCell>
                                <TableCell align="center">{t('general.table.pending')}</TableCell>
                                <TableCell align="center">{t('general.table.debtAmount')}</TableCell>
                                <TableCell align="center">{t('general.table.paidAmount')}</TableCell>
                                <TableCell align="center">{t('general.table.cost')}</TableCell>
                                <TableCell align="center">{t('general.table.netProfit')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{t('general.table.margin')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Date Row (Single period for this report) */}
                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", py: 1 } }}>
                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }}>
                                    {!reportData?.period?.startDate || dayjs(reportData.period.startDate).year() < 2000 
                                        ? (t('controls.allTime') || 'All Time')
                                        : `${dayjs(reportData.period.startDate).format('MM/DD/YYYY')} - ${dayjs(reportData.period.endDate).format('MM/DD/YYYY')}`}
                                </TableCell>
                                <TableCell colSpan={14} />
                            </TableRow>

                            {(reportData?.branches || [])
                                .filter(shop => selectedBranch === t('common.all') || shop.shopId === selectedBranch)
                                .map((shop, sIdx) => (
                                    <React.Fragment key={sIdx}>
                                        {/* Shop Header Row */}
                                        <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                            <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                            <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{getShopName(shop.shopId)}</TableCell>
                                            <TableCell colSpan={13} />
                                        </TableRow>

                                        {shop.products.map((product, pIdx) => (
                                            <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                <TableCell />
                                                <TableCell />
                                                <TableCell sx={{ pl: 2 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                                                        {product.productName}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">{product.stats.inventory.initial}</TableCell>
                                                <TableCell align="center">{product.stats.inventory.remaining}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.inventory.stockValue)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.sales.gross)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.sales.discounts)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.sales.net)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.payments.received)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.payments.pending)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.debt.incurred)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.debt.repaid)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.financials.cost)}</TableCell>
                                                <TableCell align="center">{formatCurrency(product.stats.financials.profit)}</TableCell>
                                                <TableCell align="center" sx={{ borderRight: "none" }}>{product.stats.financials.margin}%</TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Shop Subtotal Row */}
                                        <TableRow sx={{ bgcolor: "#FFF7ED", "& td": { color: "#9A3412", fontWeight: "700", fontSize: "0.80rem", py: 1, borderBottom: "2px solid #FED7AA" } }}>
                                            <TableCell colSpan={3} sx={{ pl: 2, borderRight: "none" }}>{t('common.subtotal', { name: getShopName(shop.shopId) })}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{shop.totals.inventory.initial}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{shop.totals.inventory.remaining}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.inventory.stockValue)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.sales.gross)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.sales.discounts)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.sales.net)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.payments.received)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.payments.pending)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.debt.incurred)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.debt.repaid)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{formatCurrency(shop.totals.financials.cost)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none", bgcolor: "#FDBA74", color: "#7C2D12" }}>{formatCurrency(shop.totals.financials.profit)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{shop.totals.financials.margin}%</TableCell>
                                        </TableRow>
                                        {/* Spacer Row */}
                                        <TableRow sx={{ height: 8 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>
                                    </React.Fragment>
                                ))}

                            {/* Spacer Row before Grand Total */}
                            <TableRow sx={{ height: 16 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>

                            {/* Grand Total Row */}
                            <TableRow sx={{ bgcolor: "#111827", "& td": { color: "white", fontWeight: "800", fontSize: "0.9rem", py: 1.5, borderRight: "1px solid rgba(255,255,255,0.1)" } }}>
                                <TableCell colSpan={3} sx={{ pl: 2, borderRight: "1px solid rgba(255,255,255,0.2)" }}>{t('common.total')}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{reportData?.grandTotal?.inventory?.initial || 0}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{reportData?.grandTotal?.inventory?.remaining || 0}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.inventory?.stockValue || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.sales?.gross || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.sales?.discounts || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.sales?.net || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.payments?.received || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.payments?.pending || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.debt?.incurred || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.debt?.repaid || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)" }}>{formatCurrency(reportData?.grandTotal?.financials?.cost || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "1px solid rgba(255,255,255,0.2)", bgcolor: "#10B981" }}>{formatCurrency(reportData?.grandTotal?.financials?.profit || 0)}</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>{reportData?.grandTotal?.financials?.margin || 0}%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>


                {/* Branch Selection Menu */}
                <Menu
                    anchorEl={branchAnchor}
                    open={Boolean(branchAnchor)}
                    onClose={handleClose}
                    PaperProps={{ sx: { width: 250, borderRadius: 0 } }}
                >
                    <MenuItem onClick={() => handleBranchSelect(t('common.all'))}>{t('common.all')}</MenuItem>
                    <Divider />
                    {branches.map((branchId) => (
                        <MenuItem key={branchId} onClick={() => handleBranchSelect(branchId)}>
                            {getShopName(branchId)}
                        </MenuItem>
                    ))}
                </Menu>

            </Box>
        </Fade>
    );
};

export default GeneralTab;
