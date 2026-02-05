"use client";

import React, { useState, useEffect } from 'react';
import {
    Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table,
    TableHead, TableBody, TableCell, TableRow, Menu, MenuItem, Divider, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import ReportKPI from './ReportKPI';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import debtsService from '@/services/debts';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DebtsTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        totalOutstanding: 0,
        overdueAmount: 0,
        debtorsCount: 0,
        avgDebtAge: 0
    });
    const [reportData, setReportData] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [branchAnchor, setBranchAnchor] = useState(null);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockDebts = [
                    {
                        date: '02/15/2022',
                        branches: [
                            {
                                name: 'North Branch',
                                debts: [
                                    {
                                        invoiceNo: 'INV-2022-001',
                                        customer: { name: 'Jean Pierre', phone: '0788123456' },
                                        original: 500000,
                                        paid: 50000,
                                        balance: 450000,
                                        lastPaid: '02/10/2022',
                                        dueDate: dayjs().subtract(5, 'day').format('MM/DD/YYYY'),
                                        age: 45,
                                        status: 'Overdue',
                                        saleDate: '01/01/2022',
                                        recordedBy: 'Alice'
                                    },
                                    {
                                        invoiceNo: 'INV-2022-002',
                                        customer: { name: 'Sarah M.', phone: '0788654321' },
                                        original: 120000,
                                        paid: 0,
                                        balance: 120000,
                                        lastPaid: '-',
                                        dueDate: dayjs().add(10, 'day').format('MM/DD/YYYY'),
                                        age: 20,
                                        status: 'Pending',
                                        saleDate: '01/26/2022',
                                        recordedBy: 'Bob'
                                    }
                                ]
                            },
                            {
                                name: 'South Branch',
                                debts: [
                                    {
                                        invoiceNo: 'INV-2022-003',
                                        customer: { name: 'Kigali Heights Corp', phone: '0788000111' },
                                        original: 2500000,
                                        paid: 0,
                                        balance: 2500000,
                                        lastPaid: '-',
                                        dueDate: dayjs().subtract(35, 'day').format('MM/DD/YYYY'),
                                        age: 60,
                                        status: 'Overdue',
                                        saleDate: '12/16/2021',
                                        recordedBy: 'Charlie'
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
                                debts: [
                                    {
                                        invoiceNo: 'INV-2022-004',
                                        customer: { name: 'Emmanuel R.', phone: '0788222333' },
                                        original: 85000,
                                        paid: 0,
                                        balance: 85000,
                                        lastPaid: '-',
                                        dueDate: dayjs().add(2, 'day').format('MM/DD/YYYY'),
                                        age: 15,
                                        status: 'Pending',
                                        saleDate: '01/30/2022',
                                        recordedBy: 'Alice'
                                    },
                                    {
                                        invoiceNo: 'INV-2022-005',
                                        customer: { name: 'Marie Claire', phone: '0788444555' },
                                        original: 350000,
                                        paid: 30000,
                                        balance: 320000,
                                        lastPaid: '02/05/2022',
                                        dueDate: dayjs().subtract(12, 'day').format('MM/DD/YYYY'),
                                        age: 40,
                                        status: 'Overdue',
                                        saleDate: '01/05/2022',
                                        recordedBy: 'Bob'
                                    }
                                ]
                            },
                            {
                                name: 'South Branch',
                                debts: [
                                    {
                                        invoiceNo: 'INV-2022-006',
                                        customer: { name: 'Tech Solutions Ltd', phone: '0788777888' },
                                        original: 1500000,
                                        paid: 0,
                                        balance: 1500000,
                                        lastPaid: '-',
                                        dueDate: dayjs().add(15, 'day').format('MM/DD/YYYY'),
                                        age: 10,
                                        status: 'Pending',
                                        saleDate: '02/05/2022',
                                        recordedBy: 'Charlie'
                                    }
                                ]
                            }
                        ]
                    }
                ];

                // Calculate KPIs
                let total = 0, overdue = 0, uniqueDebtors = new Set(), totalAge = 0, debtCount = 0;

                mockDebts.forEach(day => {
                    day.branches.forEach(branch => {
                        branch.debts.forEach(debt => {
                            total += debt.balance;
                            debtCount++;
                            uniqueDebtors.add(debt.customer.phone);
                            totalAge += debt.age;
                            if (debt.status === 'Overdue') overdue += debt.balance;
                        });
                    });
                });

                // Filter by selected branch
                let filteredData = mockDebts.map(day => {
                    if (selectedBranch === 'None') return { ...day, branches: [] };
                    if (selectedBranch === 'All') return day;
                    const filteredBranches = day.branches.filter(branch => branch.name === selectedBranch);
                    return { ...day, branches: filteredBranches };
                });

                setKpis({
                    totalOutstanding: total,
                    overdueAmount: overdue,
                    debtorsCount: uniqueDebtors.size,
                    avgDebtAge: debtCount > 0 ? Math.round(totalAge / debtCount) : 0
                });

                setReportData(filteredData);
                setLoading(false);
            }, 800);
        };
        fetchData();
    }, [companyId, selectedBranch, dateRange]);

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


    const getStatusColor = (status) => {
        if (status === 'Overdue') return { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' };
        return { color: '#10B981', bg: '#F0FDF4', border: '#DCFCE7' };
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, Date Picker, and Export Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        Debts Report
                    </Typography>



                </Box>

                {/* Top KPIs */}
                <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '32px'
                }}
                    className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <ReportKPI
                        title="Total Outstanding"
                        value={(() => {
                            const val = kpis?.totalOutstanding || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.totalOutstanding || 0)}
                        icon={AccountBalanceIcon}
                        color="#FF6D00"
                        index={0}
                    />
                    <ReportKPI
                        title="Overdue Amount"
                        value={(() => {
                            const val = kpis?.overdueAmount || 0;
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M FRW`;
                            if (val >= 1000) return `${(val / 1000).toFixed(1)}K FRW`;
                            return formatCurrency(val);
                        })()}
                        fullValue={formatCurrency(kpis?.overdueAmount || 0)}
                        icon={WarningIcon}
                        color="#EF4444"
                        index={1}
                    />
                    <ReportKPI
                        title="Active Debtors"
                        value={kpis?.debtorsCount || 0}
                        icon={PeopleIcon}
                        color="#3B82F6"
                        index={2}
                    />
                    <ReportKPI
                        title="Avg Debt Age"
                        value={`${kpis?.avgDebtAge || 0} Days`}
                        icon={TimerIcon}
                        color="#8B5CF6"
                        index={3}
                    />
                </div>

                {/* Hierarchical Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none" }}>
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
                                <TableCell align="center">Invoice No</TableCell>
                                <TableCell align="center" colSpan={2}>Customer Info</TableCell>
                                <TableCell align="center" colSpan={3}>Debt Amount</TableCell>
                                <TableCell align="center" colSpan={2}>Payment Info</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center" colSpan={3}>Tracking</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={3} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">Name</TableCell>
                                <TableCell align="center">Phone</TableCell>
                                <TableCell align="center">Original</TableCell>
                                <TableCell align="center">Paid</TableCell>
                                <TableCell align="center">Balance</TableCell>
                                <TableCell align="center">Last Paid</TableCell>
                                <TableCell align="center">Due Date</TableCell>
                                <TableCell align="center">Age(D)</TableCell>
                                <TableCell align="center">Sale Date</TableCell>
                                <TableCell align="center">Recorded By</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>-</TableCell>
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
                                    {day.branches.map((branch, bIdx) => (
                                        <React.Fragment key={bIdx}>
                                            {/* Branch Header Row */}
                                            <TableRow sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "700", py: 0.5 } }}>
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb" }} />
                                                <TableCell sx={{ borderRight: "1px solid #e5e7eb", pl: 4 }}>{branch.name}</TableCell>
                                                <TableCell colSpan={11} />
                                            </TableRow>
                                            {branch.debts.map((debt, pIdx) => {
                                                const statusColor = getStatusColor(debt.status);
                                                return (
                                                    <TableRow key={pIdx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 0.5 } }}>
                                                        <TableCell />
                                                        <TableCell />
                                                        <TableCell align="center" sx={{ fontWeight: "600" }}>{debt.invoiceNo}</TableCell>
                                                        <TableCell sx={{ pl: 2, fontWeight: "600" }}>{debt.customer.name}</TableCell>
                                                        <TableCell align="center">{debt.customer.phone}</TableCell>
                                                        <TableCell align="center">{formatCurrency(debt.original)}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#10B981", fontWeight: "600" }}>{formatCurrency(debt.paid)}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#EF4444", fontWeight: "700" }}>{formatCurrency(debt.balance)}</TableCell>
                                                        <TableCell align="center">{debt.lastPaid}</TableCell>
                                                        <TableCell align="center" sx={{ color: "#D97706", fontWeight: "600" }}>{debt.dueDate}</TableCell>
                                                        <TableCell align="center">{debt.age}</TableCell>
                                                        <TableCell align="center">{debt.saleDate}</TableCell>
                                                        <TableCell align="center">{debt.recordedBy}</TableCell>
                                                        <TableCell align="center" sx={{ borderRight: "none" }}>
                                                            <Box sx={{
                                                                px: 1, py: 0.3, borderRadius: "12px",
                                                                bgcolor: statusColor.bg,
                                                                color: statusColor.color,
                                                                fontWeight: '700', fontSize: '0.65rem',
                                                                border: `1px solid ${statusColor.border}`
                                                            }}>
                                                                {debt.status}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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

export default DebtsTab;
