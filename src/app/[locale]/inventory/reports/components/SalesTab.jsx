"use client";

import React, { useState, useEffect } from 'react';
import { Fade, Menu, MenuItem, Box, Grid, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Divider, Button, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
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
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [filterByKPI, setFilterByKPI] = useState(null);
    const [selectedActor, setSelectedActor] = useState('All');
    const [branchAnchor, setBranchAnchor] = useState(null);
    const [actorAnchor, setActorAnchor] = useState(null);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const allMockData = [
                    {
                        date: '02/15/2022',
                        shops: [
                            {
                                name: 'North Branch',
                                sales: [
                                    {
                                        invoiceNo: 'INV-2022-001',
                                        productName: 'iPhone 15 Pro Max',
                                        quantity: { sold: 8, returns: 0, net: 8 },
                                        value: { unitPrice: 1200000, totalAmount: 9600000 },
                                        customer: { name: 'John Doe', type: 'Retail' },
                                        tracking: { saleTime: '10:30 AM', soldBy: 'Alice' }
                                    },
                                    {
                                        invoiceNo: 'INV-2022-002',
                                        productName: 'Sony WH-1000XM5',
                                        quantity: { sold: 15, returns: 1, net: 14 },
                                        value: { unitPrice: 350000, totalAmount: 4900000 },
                                        customer: { name: 'Jane Smith', type: 'Wholesale' },
                                        tracking: { saleTime: '11:45 AM', soldBy: 'Bob' }
                                    },
                                    {
                                        invoiceNo: 'INV-2022-004',
                                        productName: 'Samsung 65" OLED TV',
                                        quantity: { sold: 3, returns: 0, net: 3 },
                                        value: { unitPrice: 2500000, totalAmount: 7500000 },
                                        customer: { name: 'ABC Corp', type: 'Corporate' },
                                        tracking: { saleTime: '01:15 PM', soldBy: 'Alice' }
                                    }
                                ]
                            },
                            {
                                name: 'South Branch',
                                sales: [
                                    {
                                        invoiceNo: 'INV-2022-003',
                                        productName: 'MacBook Air M2',
                                        quantity: { sold: 5, returns: 0, net: 5 },
                                        value: { unitPrice: 1500000, totalAmount: 7500000 },
                                        customer: { name: 'Tech Solutions', type: 'Corporate' },
                                        tracking: { saleTime: '02:15 PM', soldBy: 'Charlie' }
                                    },
                                    {
                                        invoiceNo: 'INV-2022-005',
                                        productName: 'Sony WH-1000XM5',
                                        quantity: { sold: 12, returns: 0, net: 12 },
                                        value: { unitPrice: 350000, totalAmount: 4200000 },
                                        customer: { name: 'Retail Store X', type: 'Wholesale' },
                                        tracking: { saleTime: '03:30 PM', soldBy: 'David' }
                                    }
                                ]
                            }
                        ]
                    }
                ];

                let totalRevenue = 0;
                let totalTransactions = 0;
                let productSales = {};

                allMockData.forEach(day => {
                    day.shops.forEach(shop => {
                        shop.sales.forEach(sale => {
                            totalRevenue += sale.value.totalAmount;
                            totalTransactions += 1;
                            if (!productSales[sale.productName]) {
                                productSales[sale.productName] = 0;
                            }
                            productSales[sale.productName] += sale.quantity.net;
                        });
                    });
                });

                let topProduct = 'N/A';
                let topProductQty = 0;
                Object.entries(productSales).forEach(([product, qty]) => {
                    if (qty > topProductQty) {
                        topProductQty = qty;
                        topProduct = product;
                    }
                });

                const previousPeriodRevenue = 40900000;
                const growthPercent = ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1);

                const mockStats = {
                    totalRevenue: totalRevenue,
                    totalTransactions: totalTransactions,
                    averageOrderValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
                    topProduct: topProduct,
                    topProductQuantity: topProductQty,
                    growthPercent: growthPercent,
                    previousPeriodRevenue: previousPeriodRevenue
                };

                let filteredData = allMockData.map(day => {
                    if (selectedBranch === 'None') return { ...day, shops: [] };
                    if (selectedBranch === 'All') return day;
                    const filteredShops = day.shops.filter(shop => shop.name === selectedBranch);
                    return { ...day, shops: filteredShops };
                }).map(day => {
                    // Filter by actor (soldBy)
                    if (selectedActor === 'All') return day;
                    return {
                        ...day,
                        shops: day.shops.map(s => ({
                            ...s,
                            sales: s.sales.filter(sale => sale.tracking.soldBy === selectedActor)
                        }))
                    };
                });

                setStats(mockStats);
                setReportData(filteredData);
                setLoading(false);
            }, 800);
        };
        fetchData();
    }, [companyId, selectedBranch, dateRange, selectedActor]);

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
                        Sales Report
                    </Typography>

                </Box>

                {/* Top 5 KPIs */}
                <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 5 }} sx={{ mb: 4 }}>
                    {/* KPI 1: Total Sales Revenue */}
                    <Grid item xs={1}>
                        <Box
                            onClick={() => handleKPIClick('revenue')}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                        >
                            <ReportKPI
                                title="Total Sales Revenue"
                                value={formatCurrency(stats?.totalRevenue || 0)}
                                icon={AttachMoneyIcon}
                                color="#FF6D00"
                                trend={stats?.growthPercent >= 0 ? "up" : "down"}
                                trendValue={`${stats?.growthPercent}%`}
                                index={0}
                            />
                        </Box>
                    </Grid>

                    {/* KPI 2: Total Sales Transactions */}
                    <Grid item xs={1}>
                        <Box
                            onClick={() => handleKPIClick('transactions')}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                        >
                            <ReportKPI
                                title="Total Sales Transactions"
                                value={stats?.totalTransactions || 0}
                                icon={ShoppingCartIcon}
                                color="#3B82F6"
                                index={1}
                            />
                        </Box>
                    </Grid>

                    {/* KPI 3: Average Sale Value */}
                    <Grid item xs={1}>
                        <Box
                            onClick={() => handleKPIClick('avgValue')}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                        >
                            <ReportKPI
                                title="Average Sale Value"
                                value={formatCurrency(stats?.averageOrderValue || 0)}
                                icon={ReceiptLongIcon}
                                color="#8B5CF6"
                                index={2}
                            />
                        </Box>
                    </Grid>

                    {/* KPI 4: Top-Selling Product */}
                    <Grid item xs={1}>
                        <Box
                            onClick={() => handleKPIClick('topProduct')}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                        >
                            <ReportKPI
                                title="Top-Selling Product"
                                value={`${stats?.topProduct} (${stats?.topProductQuantity} units)`}
                                icon={EmojiEventsIcon}
                                color="#F59E0B"
                                index={3}
                            />
                        </Box>
                    </Grid>

                    {/* KPI 5: Sales Growth / Decline */}
                    <Grid item xs={1}>
                        <Box
                            onClick={() => handleKPIClick('growth')}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                        >
                            <ReportKPI
                                title="Sales Growth / Decline"
                                value={`${stats?.growthPercent}%`}
                                icon={WhatshotIcon}
                                color={stats?.growthPercent >= 0 ? "#10B981" : "#EF4444"}
                                trend={stats?.growthPercent >= 0 ? "up" : "down"}
                                index={4}
                            />
                        </Box>
                    </Grid>
                </Grid>

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
                                        'Date'
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        {selectedBranch === 'All' ? 'Branch' : selectedBranch} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleActorClick}>
                                        {selectedActor === 'All' ? 'Sold By' : selectedActor} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">Invoice No</TableCell>
                                <TableCell align="center">Product Name</TableCell>
                                <TableCell align="center" colSpan={3}>Sales Quantity</TableCell>
                                <TableCell align="center" colSpan={2}>Sales Value</TableCell>
                                <TableCell align="center" colSpan={2}>Customer Info</TableCell>
                                <TableCell align="center" colSpan={2}>Tracking</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={4} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">Qty Sold</TableCell>
                                <TableCell align="center">Returns</TableCell>
                                <TableCell align="center">Net Qty</TableCell>
                                <TableCell align="center">Unit Price</TableCell>
                                <TableCell align="center">Total Amount</TableCell>
                                <TableCell align="center">Customer</TableCell>
                                <TableCell align="center">Type</TableCell>
                                <TableCell align="center">Sale Time</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>Sold By</TableCell>
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
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={13} sx={{ border: "none" }} /></TableRow>
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
                    <MenuItem onClick={() => handleBranchSelect('All')}>All</MenuItem>
                    <MenuItem onClick={() => handleBranchSelect('None')}>None</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleBranchSelect('North Branch')}>North Branch</MenuItem>
                    <MenuItem onClick={() => handleBranchSelect('South Branch')}>South Branch</MenuItem>
                </Menu>
            </Box>
        </Fade>
    );
};

export default SalesTab;
