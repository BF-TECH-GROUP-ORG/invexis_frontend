import React, { useState, useEffect } from 'react';
import {
    IconButton, Collapse, Fade, Menu, MenuItem, Button, Box, Grid, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, Typography, Divider, Stack, ToggleButton, ToggleButtonGroup
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import BusinessOverviewChart from './BusinessOverviewChart';

const GeneralTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [reportView, setReportView] = useState('daily'); // 'daily', 'monthly', 'yearly'
    const [selectedDate, setSelectedDate] = useState(dayjs()); // Current date by default
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [selectedYear, setSelectedYear] = useState(dayjs());

    // Header Selection State
    const [selectedBranch, setSelectedBranch] = useState('All');

    // Menu Anchors
    const [branchAnchor, setBranchAnchor] = useState(null);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                let mockData = [];

                if (reportView === 'daily') {
                    // Generate daily report for selected date
                    mockData = [
                        {
                            date: selectedDate.format('MM/DD/YYYY'),
                            shops: [
                                {
                                    name: 'North Branch',
                                    subtotal: { initial: 800, remaining: 500, value: 300, gross: 27000, discounts: 38000, received: 3500, pending: 35000, debt: 20000, paid: 15000, cost: 10000, profit: 10000, margin: 47 },
                                    products: [
                                        { name: 'Widget A', initial: 500, remaining: 300, value: 125, gross: 15000, discounts: 24000, received: 2000, pending: 22000, debt: 18000, paid: 12000, cost: 22000, profit: 8000, margin: 48 },
                                        { name: 'Gadget B', initial: 200, remaining: 200, value: 125, gross: 2000, discounts: 2000, received: 2000, pending: 2000, debt: 12000, paid: 3000, cost: 10000, profit: 12000, margin: 48 }
                                    ]
                                },
                                {
                                    name: 'South Branch',
                                    subtotal: { initial: 600, remaining: 450, value: 150, gross: 38000, discounts: 50000, received: 4000, pending: 46000, debt: 31000, paid: 25000, cost: 12500, profit: 16000, margin: 34 },
                                    products: [
                                        { name: 'Gizmo C', initial: 600, remaining: 400, value: 200, gross: 20000, discounts: 30000, received: 2500, pending: 27500, debt: 22000, paid: 18000, cost: 39000, profit: 3500, margin: 32 },
                                        { name: 'Tool D', initial: 600, remaining: 450, value: 150, gross: 28000, discounts: 50000, received: 4000, pending: 46000, debt: 22000, paid: 7000, cost: 3500, profit: 9000, margin: 32 }
                                    ]
                                }
                            ],
                            total: { initial: 1400, remaining: 950, value: 450, gross: 65000, discounts: 88000, received: 7500, pending: 80500, debt: 51000, paid: 40000, cost: 22500, profit: 30500, margin: 38 }
                        }
                    ];
                } else if (reportView === 'monthly') {
                    // Generate monthly summary (aggregated by week or day of month)
                    const daysInMonth = selectedMonth.daysInMonth();
                    mockData = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, weekIdx) => ({
                        date: `Week ${weekIdx + 1} - ${selectedMonth.format('MMMM YYYY')}`,
                        shops: [
                            {
                                name: 'North Branch',
                                subtotal: { initial: 800 * (weekIdx + 1), remaining: 500 * (weekIdx + 1), value: 300 * (weekIdx + 1), gross: 27000 * (weekIdx + 1), discounts: 38000 * (weekIdx + 1), received: 3500 * (weekIdx + 1), pending: 35000 * (weekIdx + 1), debt: 20000 * (weekIdx + 1), paid: 15000 * (weekIdx + 1), cost: 10000 * (weekIdx + 1), profit: 10000 * (weekIdx + 1), margin: 47 },
                                products: [
                                    { name: 'Widget A', initial: 500 * (weekIdx + 1), remaining: 300 * (weekIdx + 1), value: 125 * (weekIdx + 1), gross: 15000 * (weekIdx + 1), discounts: 24000 * (weekIdx + 1), received: 2000 * (weekIdx + 1), pending: 22000 * (weekIdx + 1), debt: 18000 * (weekIdx + 1), paid: 12000 * (weekIdx + 1), cost: 22000 * (weekIdx + 1), profit: 8000 * (weekIdx + 1), margin: 48 }
                                ]
                            },
                            {
                                name: 'South Branch',
                                subtotal: { initial: 600 * (weekIdx + 1), remaining: 450 * (weekIdx + 1), value: 150 * (weekIdx + 1), gross: 38000 * (weekIdx + 1), discounts: 50000 * (weekIdx + 1), received: 4000 * (weekIdx + 1), pending: 46000 * (weekIdx + 1), debt: 31000 * (weekIdx + 1), paid: 25000 * (weekIdx + 1), cost: 12500 * (weekIdx + 1), profit: 16000 * (weekIdx + 1), margin: 34 },
                                products: [
                                    { name: 'Gizmo C', initial: 600 * (weekIdx + 1), remaining: 400 * (weekIdx + 1), value: 200 * (weekIdx + 1), gross: 20000 * (weekIdx + 1), discounts: 30000 * (weekIdx + 1), received: 2500 * (weekIdx + 1), pending: 27500 * (weekIdx + 1), debt: 22000 * (weekIdx + 1), paid: 18000 * (weekIdx + 1), cost: 39000 * (weekIdx + 1), profit: 3500 * (weekIdx + 1), margin: 32 }
                                ]
                            }
                        ],
                        total: { initial: 1400 * (weekIdx + 1), remaining: 950 * (weekIdx + 1), value: 450 * (weekIdx + 1), gross: 65000 * (weekIdx + 1), discounts: 88000 * (weekIdx + 1), received: 7500 * (weekIdx + 1), pending: 80500 * (weekIdx + 1), debt: 51000 * (weekIdx + 1), paid: 40000 * (weekIdx + 1), cost: 22500 * (weekIdx + 1), profit: 30500 * (weekIdx + 1), margin: 38 }
                    }));
                } else if (reportView === 'yearly') {
                    // Generate yearly summary (aggregated by month)
                    mockData = Array.from({ length: 12 }, (_, monthIdx) => {
                        const monthName = dayjs().month(monthIdx).format('MMM YYYY');
                        return {
                            date: monthName,
                            shops: [
                                {
                                    name: 'North Branch',
                                    subtotal: { initial: 800 * (monthIdx + 1), remaining: 500 * (monthIdx + 1), value: 300 * (monthIdx + 1), gross: 27000 * (monthIdx + 1), discounts: 38000 * (monthIdx + 1), received: 3500 * (monthIdx + 1), pending: 35000 * (monthIdx + 1), debt: 20000 * (monthIdx + 1), paid: 15000 * (monthIdx + 1), cost: 10000 * (monthIdx + 1), profit: 10000 * (monthIdx + 1), margin: 47 },
                                    products: [
                                        { name: 'Widget A', initial: 500 * (monthIdx + 1), remaining: 300 * (monthIdx + 1), value: 125 * (monthIdx + 1), gross: 15000 * (monthIdx + 1), discounts: 24000 * (monthIdx + 1), received: 2000 * (monthIdx + 1), pending: 22000 * (monthIdx + 1), debt: 18000 * (monthIdx + 1), paid: 12000 * (monthIdx + 1), cost: 22000 * (monthIdx + 1), profit: 8000 * (monthIdx + 1), margin: 48 }
                                    ]
                                },
                                {
                                    name: 'South Branch',
                                    subtotal: { initial: 600 * (monthIdx + 1), remaining: 450 * (monthIdx + 1), value: 150 * (monthIdx + 1), gross: 38000 * (monthIdx + 1), discounts: 50000 * (monthIdx + 1), received: 4000 * (monthIdx + 1), pending: 46000 * (monthIdx + 1), debt: 31000 * (monthIdx + 1), paid: 25000 * (monthIdx + 1), cost: 12500 * (monthIdx + 1), profit: 16000 * (monthIdx + 1), margin: 34 },
                                    products: [
                                        { name: 'Gizmo C', initial: 600 * (monthIdx + 1), remaining: 400 * (monthIdx + 1), value: 200 * (monthIdx + 1), gross: 20000 * (monthIdx + 1), discounts: 30000 * (monthIdx + 1), received: 2500 * (monthIdx + 1), pending: 27500 * (monthIdx + 1), debt: 22000 * (monthIdx + 1), paid: 18000 * (monthIdx + 1), cost: 39000 * (monthIdx + 1), profit: 3500 * (monthIdx + 1), margin: 32 }
                                    ]
                                }
                            ],
                            total: { initial: 1400 * (monthIdx + 1), remaining: 950 * (monthIdx + 1), value: 450 * (monthIdx + 1), gross: 65000 * (monthIdx + 1), discounts: 88000 * (monthIdx + 1), received: 7500 * (monthIdx + 1), pending: 80500 * (monthIdx + 1), debt: 51000 * (monthIdx + 1), paid: 40000 * (monthIdx + 1), cost: 22500 * (monthIdx + 1), profit: 30500 * (monthIdx + 1), margin: 38 }
                        };
                    });
                }

                // Apply branch filter
                const filteredData = mockData.map(day => {
                    if (selectedBranch === 'None') return { ...day, shops: [] };
                    if (selectedBranch === 'All') return day;
                    const filteredShops = day.shops.filter(shop => shop.name === selectedBranch);
                    return { ...day, shops: filteredShops };
                });

                setReportData(filteredData);
                setLoading(false);
            }, 800);
        };
        fetchData();
    }, [reportView, selectedDate, selectedMonth, selectedYear, selectedBranch]);

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

    const getDateLabel = () => {
        if (reportView === 'daily') return selectedDate.format('MM/DD/YYYY');
        if (reportView === 'monthly') return selectedMonth.format('MMMM YYYY');
        if (reportView === 'yearly') return selectedYear.format('YYYY');
        return '';
    };

    // Calculate totals for monthly/yearly views
    const calculateAggregateTotal = () => {
        if (reportView === 'daily') return null; // Daily doesn't need aggregate

        let aggregate = {
            initial: 0,
            remaining: 0,
            value: 0,
            gross: 0,
            discounts: 0,
            received: 0,
            pending: 0,
            debt: 0,
            paid: 0,
            cost: 0,
            profit: 0,
            margin: 0
        };

        reportData.forEach(day => {
            day.shops.forEach(shop => {
                aggregate.initial += shop.subtotal.initial;
                aggregate.remaining += shop.subtotal.remaining;
                aggregate.value += shop.subtotal.value;
                aggregate.gross += shop.subtotal.gross;
                aggregate.discounts += shop.subtotal.discounts;
                aggregate.received += shop.subtotal.received;
                aggregate.pending += shop.subtotal.pending;
                aggregate.debt += shop.subtotal.debt;
                aggregate.paid += shop.subtotal.paid;
                aggregate.cost += shop.subtotal.cost;
                aggregate.profit += shop.subtotal.profit;
            });
        });

        // Calculate average margin
        if (reportData.length > 0) {
            let totalMargin = 0;
            let shopCount = 0;
            reportData.forEach(day => {
                day.shops.forEach(shop => {
                    totalMargin += shop.subtotal.margin;
                    shopCount++;
                });
            });
            aggregate.margin = shopCount > 0 ? Math.round(totalMargin / shopCount) : 0;
        }

        return aggregate;
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, and Date Picker */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 0 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        General Business Report
                    </Typography>

                    {/* Report View Toggle and Date Picker Container */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ToggleButtonGroup
                        value={reportView}
                        exclusive
                        onChange={(event, newView) => {
                            if (newView !== null) setReportView(newView);
                        }}
                        sx={{
                            '& .MuiToggleButton-root': {
                                textTransform: 'none',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                color: '#6B7280',
                                '&.Mui-selected': {
                                    bgcolor: '#FF6D00',
                                    color: 'white',
                                    borderColor: '#FF6D00',
                                    '&:hover': {
                                        bgcolor: '#E55D00'
                                    }
                                },
                                '&:hover': {
                                    bgcolor: '#f3f4f6'
                                }
                            }
                        }}
                    >
                        <ToggleButton value="daily">Daily</ToggleButton>
                        <ToggleButton value="monthly">Monthly</ToggleButton>
                        <ToggleButton value="yearly">Yearly</ToggleButton>
                    </ToggleButtonGroup>

                    {/* Date Picker based on view */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {reportView === 'daily' && (
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 130,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                '& fieldset': {
                                                    borderColor: '#e5e7eb'
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                        {reportView === 'monthly' && (
                            <DatePicker
                                views={['year', 'month']}
                                label="Select Month"
                                value={selectedMonth}
                                onChange={(newValue) => setSelectedMonth(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 130,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                '& fieldset': {
                                                    borderColor: '#e5e7eb'
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                        {reportView === 'yearly' && (
                            <DatePicker
                                views={['year']}
                                label="Select Year"
                                value={selectedYear}
                                onChange={(newValue) => setSelectedYear(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 110,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                '& fieldset': {
                                                    borderColor: '#e5e7eb'
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </LocalizationProvider>
                    </Box>
                </Box>

                {/* Top KPIs */}
                <Grid container spacing={2} columns={5} sx={{ mb: 4 }}>
                    {[
                        { title: "Total Revenue", value: "$1,250,890", Icon: DollarSign, color: "#3b82f6", bgColor: "#eff6ff" },
                        { title: "Total Costs", value: "$745,300", Icon: BarChart3, color: "#f59e0b", bgColor: "#fef3c7" },
                        { title: "Net Profit", value: "$505,590", Icon: TrendingUp, color: "#10b981", bgColor: "#ecfdf5" },
                        { title: "Outstanding Debts", value: "$132,800", Icon: CreditCard, color: "#ef4444", bgColor: "#fee2e2" },
                        { title: "Total Return", value: "$398,820", Icon: RefreshCw, color: "#8b5cf6", bgColor: "#f3e8ff" }
                    ].map((kpi, i) => (
                        <Grid item xs={5} sm={5} md={1} key={i}>
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
                        </Grid>
                    ))}
                </Grid>

                {/* Business Overview Chart */}
                <BusinessOverviewChart reportView={reportView} />

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none", "& .MuiPaper-root": { borderRadius: "0px !important" } }}>
                    <Table size="small">
                        <TableHead>
                            {/* Main Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">
                                    {getDateLabel()}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        {selectedBranch === 'All' ? 'Branch' : selectedBranch} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">Product</TableCell>
                                <TableCell align="center" colSpan={3}>Inventory</TableCell>
                                <TableCell align="center" colSpan={2}>Sales</TableCell>
                                <TableCell align="center" colSpan={2}>Payments</TableCell>
                                <TableCell align="center" colSpan={2}>Debts</TableCell>
                                <TableCell align="center">Cost</TableCell>
                                <TableCell align="center" colSpan={2}>Profit</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={3} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">Initial Stock</TableCell>
                                <TableCell align="center">Remaining</TableCell>
                                <TableCell align="center">Stock Value</TableCell>
                                <TableCell align="center">Gross Sales</TableCell>
                                <TableCell align="center">Discounts</TableCell>
                                <TableCell align="center">Received</TableCell>
                                <TableCell align="center">Pending</TableCell>
                                <TableCell align="center">Debt Amount</TableCell>
                                <TableCell align="center">Paid Amount</TableCell>
                                <TableCell align="center">Cost</TableCell>
                                <TableCell align="center">Net Profit</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>Margin %</TableCell>
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
                                            {shop.products.map((product, pIdx) => (
                                                <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                    <TableCell />
                                                    <TableCell />
                                                    <TableCell sx={{ pl: 2 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                                                            {product.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">{product.initial}</TableCell>
                                                    <TableCell align="center">{product.remaining}</TableCell>
                                                    <TableCell align="center">{product.value}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.gross)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.discounts)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.received)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.pending)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.debt)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.paid)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.cost)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.profit)}</TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "none" }}>{product.margin}%</TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Shop Subtotal Row - Always show */}
                                            <TableRow sx={{ bgcolor: "#e9824bff", "& td": { color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                                <TableCell colSpan={3} sx={{ pl: 2 }}>{shop.name} Subtotal</TableCell>
                                                <TableCell align="center">{shop.subtotal.initial}</TableCell>
                                                <TableCell align="center">{shop.subtotal.remaining}</TableCell>
                                                <TableCell align="center">{shop.subtotal.value}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.gross)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.discounts)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.received)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.pending)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.debt)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.paid)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.cost)}</TableCell>
                                                <TableCell align="center">{formatCurrency(shop.subtotal.profit)}</TableCell>
                                                <TableCell align="center" sx={{ borderRight: "none" }}>{shop.subtotal.margin}%</TableCell>
                                            </TableRow>
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
                                    {/* Spacer Row before Grand Total - Only for daily view */}
                                    {reportView === 'daily' && (
                                        <TableRow sx={{ height: 16 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>
                                    )}

                                    {/* Grand Total Row - Only for daily view */}
                                    {reportView === 'daily' && (
                                        <TableRow sx={{ bgcolor: "#3b2005ff", "& td": { color: "white", fontWeight: "800", fontSize: "0.9rem", py: 1.5, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                            <TableCell colSpan={3} sx={{ pl: 2 }}>Total</TableCell>
                                            <TableCell align="center">{day.total.initial}</TableCell>
                                            <TableCell align="center">{day.total.remaining}</TableCell>
                                            <TableCell align="center">{day.total.value}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.gross)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.discounts)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.received)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.pending)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.debt)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.paid)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.cost)}</TableCell>
                                            <TableCell align="center">{formatCurrency(day.total.profit)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{day.total.margin}%</TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}

                            {/* Final Aggregate Total Row - For monthly/yearly views */}
                            {(reportView === 'monthly' || reportView === 'yearly') && calculateAggregateTotal() && (() => {
                                const total = calculateAggregateTotal();
                                return (
                                    <>
                                        <TableRow sx={{ height: 24 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>
                                        <TableRow sx={{ bgcolor: "#3b2005ff", "& td": { color: "white", fontWeight: "800", fontSize: "0.95rem", py: 2, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
                                            <TableCell colSpan={3} sx={{ pl: 2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, bgcolor: "#FF6D00", borderRadius: "50%" }} />
                                                    Total for {reportView === 'monthly' ? selectedMonth.format('MMMM YYYY') : selectedYear.format('YYYY')}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">{total.initial}</TableCell>
                                            <TableCell align="center">{total.remaining}</TableCell>
                                            <TableCell align="center">{total.value}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.gross)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.discounts)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.received)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.pending)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.debt)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.paid)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.cost)}</TableCell>
                                            <TableCell align="center">{formatCurrency(total.profit)}</TableCell>
                                            <TableCell align="center" sx={{ borderRight: "none" }}>{total.margin}%</TableCell>
                                        </TableRow>
                                    </>
                                );
                            })()}
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

                {/* Recommendation Section */}
                <Box sx={{ mt: 4, p: 3, bgcolor: "white", border: "1px solid #e5e7eb", borderRadius: 0, boxShadow: "none" }}>
                    <Typography variant="body2" sx={{ color: "#374151", fontWeight: "500" }}>
                        <Box component="span" sx={{ color: "#ea580c", fontWeight: "800" }}>Recommendation:</Box> Focus on reducing pending payments to improve cash flow and consider strategies to increase net profit margins consistently.
                    </Typography>
                </Box>
            </Box>
        </Fade>
    );
};

export default GeneralTab;
