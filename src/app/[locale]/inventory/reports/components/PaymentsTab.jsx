import React, { useState, useEffect } from 'react';
import {
    Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table,
    TableHead, TableBody, TableCell, TableRow, Menu, MenuItem, Divider
} from '@mui/material';
import ReportKPI from './ReportKPI';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import analyticsService from '@/services/analyticsService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

const PaymentsTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [kpis, setKpis] = useState({
        totalReceived: 0,
        pendingAmount: 0,
        failedAmount: 0,
        avgPaymentSize: 0
    });

    // Header Selection State
    const [selectedDate, setSelectedDate] = useState('02/15/2022');
    const [selectedBranch, setSelectedBranch] = useState('All');

    // Menu Anchors
    const [dateAnchor, setDateAnchor] = useState(null);
    const [branchAnchor, setBranchAnchor] = useState(null);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockPayments = [
                    {
                        date: '02/15/2022',
                        branches: [
                            {
                                name: 'North Branch',
                                payments: [
                                    {
                                        customer: { name: 'Jean Pierre', phone: '0788123456' },
                                        invoiceNo: 'INV-2022-001',
                                        amount: 250000,
                                        method: 'Mobile Money',
                                        status: 'Completed',
                                        saleDebtRef: 'SALE-001',
                                        receivedBy: 'Alice',
                                        time: '10:30 AM'
                                    },
                                    {
                                        customer: { name: 'Marie Dupont', phone: '0788654321' },
                                        invoiceNo: 'INV-2022-002',
                                        amount: 150000,
                                        method: 'Cash',
                                        status: 'Completed',
                                        saleDebtRef: 'SALE-002',
                                        receivedBy: 'Bob',
                                        time: '11:15 AM'
                                    },
                                    {
                                        customer: { name: 'Pierre Martin', phone: '0788999888' },
                                        invoiceNo: 'INV-2022-003',
                                        amount: 75000,
                                        method: 'Bank Transfer',
                                        status: 'Pending',
                                        saleDebtRef: 'DEBT-001',
                                        receivedBy: 'Charlie',
                                        time: '09:45 AM'
                                    }
                                ]
                            },
                            {
                                name: 'South Branch',
                                payments: [
                                    {
                                        customer: { name: 'Jacques Lemaire', phone: '0788777666' },
                                        invoiceNo: 'INV-2022-004',
                                        amount: 320000,
                                        method: 'Mobile Money',
                                        status: 'Completed',
                                        saleDebtRef: 'SALE-003',
                                        receivedBy: 'Diana',
                                        time: '02:20 PM'
                                    },
                                    {
                                        customer: { name: 'Sophie Laurent', phone: '0788555444' },
                                        invoiceNo: 'INV-2022-005',
                                        amount: 95000,
                                        method: 'Credit Card',
                                        status: 'Failed',
                                        saleDebtRef: 'SALE-004',
                                        receivedBy: 'Eve',
                                        time: '03:10 PM'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        date: '02/14/2022',
                        branches: [
                            {
                                name: 'North Branch',
                                payments: [
                                    {
                                        customer: { name: 'Robert Chen', phone: '0788333222' },
                                        invoiceNo: 'INV-2022-006',
                                        amount: 200000,
                                        method: 'Mobile Money',
                                        status: 'Completed',
                                        saleDebtRef: 'SALE-005',
                                        receivedBy: 'Frank',
                                        time: '08:00 AM'
                                    }
                                ]
                            }
                        ]
                    }
                ];

                // Calculate KPIs
                let totalReceived = 0;
                let pendingAmount = 0;
                let failedAmount = 0;
                let paymentCount = 0;

                mockPayments.forEach(day => {
                    day.branches.forEach(branch => {
                        branch.payments.forEach(payment => {
                            paymentCount++;
                            if (payment.status === 'Completed') {
                                totalReceived += payment.amount;
                            } else if (payment.status === 'Pending') {
                                pendingAmount += payment.amount;
                            } else if (payment.status === 'Failed') {
                                failedAmount += payment.amount;
                            }
                        });
                    });
                });

                setKpis({
                    totalReceived,
                    pendingAmount,
                    failedAmount,
                    avgPaymentSize: paymentCount > 0 ? Math.round(totalReceived / paymentCount) : 0
                });

                // Filter by selected branch
                const filteredData = mockPayments.map(day => {
                    if (selectedBranch === 'None') return { ...day, branches: [] };
                    if (selectedBranch === 'All') return day;
                    const filteredBranches = day.branches.filter(b => b.name === selectedBranch);
                    return { ...day, branches: filteredBranches };
                });

                setReportData(filteredData);
                setLoading(false);
            }, 800);
        };

        fetchData();
    }, [companyId, dateRange, selectedBranch, selectedDate]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const formatCurrency = (val) => `${val.toLocaleString()} FRW`;

    const handleDateClick = (event) => setDateAnchor(event.currentTarget);
    const handleBranchClick = (event) => setBranchAnchor(event.currentTarget);
    const handleClose = () => { setDateAnchor(null); setBranchAnchor(null); };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        handleClose();
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        handleClose();
    };

    const getStatusColor = (status) => {
        if (status === 'Completed') return { color: '#10B981', bg: '#F0FDF4', border: '#DCFCE7' };
        if (status === 'Pending') return { color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' };
        return { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' };
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb", p: 3 }}>
                {/* Top KPIs */}
                <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 4 }} sx={{ mb: 4 }}>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Total Received"
                            value={formatCurrency(kpis?.totalReceived || 0)}
                            icon={AccountBalanceWalletIcon}
                            color="#10B981"
                            index={0}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Pending Payments"
                            value={formatCurrency(kpis?.pendingAmount || 0)}
                            icon={AccessTimeIcon}
                            color="#F59E0B"
                            index={1}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Failed Payments"
                            value={formatCurrency(kpis?.failedAmount || 0)}
                            icon={CancelIcon}
                            color="#EF4444"
                            index={2}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Avg Payment Size"
                            value={formatCurrency(kpis?.avgPaymentSize || 0)}
                            icon={PieChartIcon}
                            color="#3B82F6"
                            index={3}
                        />
                    </Grid>
                </Grid>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none" }}>
                    <Table size="small">
                        <TableHead>
                            {/* Main Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
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
                                <TableCell align="center" colSpan={2}>Customer Info</TableCell>
                                <TableCell align="center">Invoice No</TableCell>
                                <TableCell align="center" colSpan={2}>Payment Info</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center" colSpan={3}>Reference</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={2} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">Name</TableCell>
                                <TableCell align="center">Phone</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">Amount</TableCell>
                                <TableCell align="center">Method</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">Sale/Debt Ref</TableCell>
                                <TableCell align="center">Received By</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((day, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    {/* Date Row */}
                                    <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.85rem", fontWeight: "700", py: 1 } }}>
                                        <TableCell sx={{ borderRight: "1px solid #e5e7eb" }}>{day.date}</TableCell>
                                        <TableCell colSpan={11} />
                                    </TableRow>
                                    {day.branches.map((branch, bIdx) => (
                                        <React.Fragment key={bIdx}>
                                            {/* Branch Header Row */}
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{branch.name}</TableCell>
                                                <TableCell colSpan={10} />
                                            </TableRow>
                                            {branch.payments.map((payment, pIdx) => {
                                                const statusColor = getStatusColor(payment.status);
                                                return (
                                                    <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                        <TableCell />
                                                        <TableCell />
                                                        <TableCell sx={{ pl: 2, fontWeight: "600" }}>{payment.customer.name}</TableCell>
                                                        <TableCell align="center">{payment.customer.phone}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "600" }}>{payment.invoiceNo}</TableCell>
                                                        <TableCell align="right" sx={{ color: "#10B981", fontWeight: "600" }}>{formatCurrency(payment.amount)}</TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{payment.method}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "1px solid #e5e7eb" }}>
                                                            <Box sx={{
                                                                px: 1, py: 0.3, borderRadius: "12px",
                                                                bgcolor: statusColor.bg,
                                                                color: statusColor.color,
                                                                fontWeight: '700', fontSize: '0.65rem',
                                                                border: `1px solid ${statusColor.border}`
                                                            }}>
                                                                {payment.status}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{payment.saleDebtRef}</TableCell>
                                                        <TableCell align="center">{payment.receivedBy}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>{payment.time}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={12} sx={{ border: "none" }} /></TableRow>
                                        </React.Fragment>
                                    ))}
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
                    PaperProps={{ sx: { width: 200, borderRadius: 0 } }}
                >
                    <MenuItem onClick={() => handleDateSelect('02/15/2022')}>02/15/2022</MenuItem>
                    <MenuItem onClick={() => handleDateSelect('02/14/2022')}>02/14/2022</MenuItem>
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
            </Box>
        </Fade>
    );
};

export default PaymentsTab;
