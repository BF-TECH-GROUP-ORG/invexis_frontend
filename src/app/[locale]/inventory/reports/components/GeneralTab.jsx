import React, { useState, useEffect } from 'react';
import {
    Grid, Box, CircularProgress, Paper, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Collapse, Fade, Menu, MenuItem, Button, TextField, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';

const GeneralTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);

    // Header Selection State
    const [selectedDate, setSelectedDate] = useState('02/15/2022');
    const [selectedBranch, setSelectedBranch] = useState('All');

    // Custom Date Range State
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isCustomRange, setIsCustomRange] = useState(false);

    // Menu Anchors
    const [dateAnchor, setDateAnchor] = useState(null);
    const [branchAnchor, setBranchAnchor] = useState(null);

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

                // Filter by selected branch
                let filteredData = allMockData.map(day => {
                    if (selectedBranch === 'None') return { ...day, shops: [], total: { ...day.total, initial: 0, remaining: 0, value: 0, gross: 0, discounts: 0, received: 0, pending: 0, debt: 0, paid: 0, cost: 0, profit: 0, margin: 0 } };
                    if (selectedBranch === 'All') return day;

                    const filteredShops = day.shops.filter(shop => shop.name === selectedBranch);
                    const newTotal = filteredShops.reduce((acc, shop) => ({
                        initial: acc.initial + shop.subtotal.initial,
                        remaining: acc.remaining + shop.subtotal.remaining,
                        value: acc.value + shop.subtotal.value,
                        gross: acc.gross + shop.subtotal.gross,
                        discounts: acc.discounts + shop.subtotal.discounts,
                        received: acc.received + shop.subtotal.received,
                        pending: acc.pending + shop.subtotal.pending,
                        debt: acc.debt + shop.subtotal.debt,
                        paid: acc.paid + shop.subtotal.paid,
                        cost: acc.cost + shop.subtotal.cost,
                        profit: acc.profit + shop.subtotal.profit,
                        margin: shop.subtotal.margin // Simplified for mock
                    }), { initial: 0, remaining: 0, value: 0, gross: 0, discounts: 0, received: 0, pending: 0, debt: 0, paid: 0, cost: 0, profit: 0, margin: 0 });

                    return { ...day, shops: filteredShops, total: newTotal };
                });

                setReportData(filteredData);
                setLoading(false);
            }, 800);
        };
        fetchData();
    }, [companyId, dateRange, selectedBranch, selectedDate, isCustomRange, customStartDate, customEndDate]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => `$${val.toLocaleString()}`;

    const handleDateClick = (event) => setDateAnchor(event.currentTarget);
    const handleBranchClick = (event) => setBranchAnchor(event.currentTarget);
    const handleClose = () => { setDateAnchor(null); setBranchAnchor(null); };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        handleClose();
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsCustomRange(false);
        handleClose();
    };

    const handleApplyCustomRange = () => {
        if (customStartDate && customEndDate) {
            setSelectedDate(`${customStartDate} - ${customEndDate}`);
            setIsCustomRange(true);
            handleClose();
        }
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb", p: 0 }}>
                <Typography variant="h5" align="left" fontWeight="700" sx={{ mb: 2, mt: 2, color: "#111827" }}>
                    General Business Report – Full Overview
                </Typography>

                {/* Top KPIs */}
                <Grid container spacing={0} sx={{ mb: 3 }}>
                    {[
                        { title: "Total Revenue", value: "$1,250,890", color: "#ea580c" },
                        { title: "Total Costs", value: "$745,300", color: "#ea580c" },
                        { title: "Net Profit", value: "$505,590", color: "#ea580c" },
                        { title: "Outstanding Debts", value: "$132,800", color: "#ea580c" },
                        { title: "Total Return", value: "$398,820", color: "#ea580c" }
                    ].map((kpi, i) => (
                        <Grid item xs={12} sm={6} md={2.4} key={i}>
                            <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid #e5e7eb", borderRadius: 0 }}>
                                <Box sx={{ width: 40, height: 40, bgcolor: kpi.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.2rem" }}>$</Box>
                                <Box>
                                    <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>{kpi.title}</Typography>
                                    <Typography variant="h6" fontWeight="800" sx={{ color: "#111827" }}>{kpi.value}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 0, overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            {/* Main Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #444", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleDateClick}>
                                        {selectedDate} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
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
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #444", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
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
                                            {/* Shop Subtotal Row */}
                                            <TableRow sx={{ bgcolor: "#ea580c", "& td": { color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
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
                                    {/* Spacer Row before Grand Total */}
                                    <TableRow sx={{ height: 16 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>

                                    {/* Grand Total Row */}
                                    <TableRow sx={{ bgcolor: "#b3afabff", "& td": { color: "white", fontWeight: "800", fontSize: "0.9rem", py: 1.5, borderRight: "1px solid rgba(255,255,255,0.2)" } }}>
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
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Date Selection Menu */}
                <Menu
                    anchorEl={dateAnchor}
                    open={Boolean(dateAnchor)}
                    onClose={handleClose}
                    PaperProps={{ sx: { width: 280, p: 2, borderRadius: 0 } }}
                >
                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>Available Dates</Typography>
                    <MenuItem onClick={() => handleDateSelect('02/15/2022')}>02/15/2022</MenuItem>
                    <MenuItem onClick={() => handleDateSelect('02/14/2022')}>02/14/2022</MenuItem>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>Custom Range</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="From"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                        />
                        <TextField
                            label="To"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                        />
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleApplyCustomRange}
                            sx={{ bgcolor: "#333", color: "white", borderRadius: 0, '&:hover': { bgcolor: "#444" } }}
                        >
                            Apply Range
                        </Button>
                    </Box>
                </Menu>

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
                <Box sx={{ mt: 4, p: 3, bgcolor: "white", border: "1px solid #e5e7eb", borderRadius: 0 }}>
                    <Typography variant="body2" sx={{ color: "#374151", fontWeight: "500" }}>
                        <Box component="span" sx={{ color: "#ea580c", fontWeight: "800" }}>Recommendation:</Box> Focus on reducing pending payments to improve cash flow and consider strategies to increase net profit margins consistently.
                    </Typography>
                </Box>
            </Box>
        </Fade>
    );
};

export default GeneralTab;
