"use client";

import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Fade, Paper, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Button, ToggleButton, ToggleButtonGroup, Menu, MenuItem, Divider } from '@mui/material';
import ReportKPI from './ReportKPI';
import GroupIcon from '@mui/icons-material/Group';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import analyticsService from '@/services/analyticsService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const StaffTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState([]);
    const [branchData, setBranchData] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedActor, setSelectedActor] = useState('All');
    const [branchAnchor, setBranchAnchor] = useState(null);
    const [actorAnchor, setActorAnchor] = useState(null);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockStaffData = [
                    { staffName: 'Jean Pierre', role: 'Sales Manager', branch: 'North Branch', transactions: 145, revenue: 12500000, status: 'Active' },
                    { staffName: 'Sarah Smith', role: 'Sales Associate', branch: 'North Branch', transactions: 132, revenue: 11200000, status: 'Active' },
                    { staffName: 'Emmanuel R.', role: 'Sales Associate', branch: 'South Branch', transactions: 98, revenue: 8400000, status: 'Active' },
                    { staffName: 'Marie Claire', role: 'Cashier', branch: 'South Branch', transactions: 85, revenue: 7200000, status: 'Active' },
                    { staffName: 'Alice', role: 'Sales Manager', branch: 'North Branch', transactions: 120, revenue: 10800000, status: 'Active' },
                    { staffName: 'Bob', role: 'Sales Associate', branch: 'North Branch', transactions: 95, revenue: 8500000, status: 'Active' },
                ];

                const mockBranchData = [
                    { branchName: 'North Branch', location: 'Kigali Downtown', transactions: 492, revenue: 42800000, avgTransaction: 87000, staffCount: 4, status: 'Performing' },
                    { branchName: 'South Branch', location: 'Kigali Heights', transactions: 283, revenue: 24600000, avgTransaction: 86900, staffCount: 3, status: 'Performing' },
                ];

                // Filter by branch
                let filteredStaff = mockStaffData;
                if (selectedBranch !== 'All') {
                    filteredStaff = mockStaffData.filter(s => s.branch === selectedBranch);
                }

                // Filter by actor (staff member)
                if (selectedActor !== 'All') {
                    filteredStaff = filteredStaff.filter(s => s.staffName === selectedActor);
                }

                setStaffData(filteredStaff);
                setBranchData(mockBranchData);
                setLoading(false);
            }, 800);
        };

        fetchData();
    }, [companyId, dateRange, selectedBranch, selectedActor]);

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

    const totalRevenue = staffData.reduce((sum, s) => sum + s.revenue, 0);
    const totalTransactions = staffData.reduce((sum, s) => sum + s.transactions, 0);
    const avgPerTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
    const topPerformer = staffData.length > 0 ? staffData.reduce((prev, current) => current.revenue > prev.revenue ? current : prev) : null;

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, and Date Picker */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1.5 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        Staff Report
                    </Typography>

                </Box>

                {/* Top KPIs */}
                <Typography variant="h6" fontWeight="700" sx={{ color: "#111827", mb: 2 }}>Staff Metrics</Typography>
                <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 4 }} sx={{ mb: 4 }}>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Total Staff"
                            value={staffData.length}
                            icon={GroupIcon}
                            color="#FF6D00"
                            index={0}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Active Staff Today"
                            value={staffData.filter(s => s.status === 'Active').length}
                            icon={StarIcon}
                            color="#10B981"
                            index={1}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Top Performing Staff"
                            value={topPerformer?.staffName || "N/A"}
                            subValue={topPerformer ? formatCurrency(topPerformer.revenue) : ""}
                            icon={TrendingUpIcon}
                            color="#3B82F6"
                            index={2}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Lowest Activity Staff"
                            value={staffData.length > 0 ? staffData.reduce((prev, current) => current.transactions < prev.transactions ? current : prev).staffName : "N/A"}
                            icon={GroupIcon}
                            color="#F59E0B"
                            index={3}
                        />
                    </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="700" sx={{ color: "#111827", mb: 2 }}>Branch Metrics</Typography>
                <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 4 }} sx={{ mb: 4 }}>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Total Branches"
                            value={branchData.length}
                            icon={StoreIcon}
                            color="#FF6D00"
                            index={4}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Most Active Branch"
                            value={branchData.length > 0 ? branchData.reduce((prev, current) => current.transactions > prev.transactions ? current : prev).branchName : "N/A"}
                            icon={TrendingUpIcon}
                            color="#10B981"
                            index={5}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Highest Revenue Branch"
                            value={branchData.length > 0 ? branchData.reduce((prev, current) => current.revenue > prev.revenue ? current : prev).branchName : "N/A"}
                            subValue={branchData.length > 0 ? formatCurrency(branchData.reduce((prev, current) => current.revenue > prev.revenue ? current : prev).revenue) : ""}
                            icon={StarIcon}
                            color="#8B5CF6"
                            index={6}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <ReportKPI
                            title="Underperforming Branches"
                            value={branchData.filter(b => b.transactions < 300).length}
                            icon={GroupIcon}
                            color="#EF4444"
                            index={7}
                        />
                    </Grid>
                </Grid>

                {/* Branch Performance Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none", mb: 4 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">BRANCH NAME</TableCell>
                                <TableCell align="center">LOCATION</TableCell>
                                <TableCell align="center">TRANSACTIONS</TableCell>
                                <TableCell align="center">REVENUE (FRW)</TableCell>
                                <TableCell align="center">AVG / TRANSACTION</TableCell>
                                <TableCell align="center">ACTIVE STAFF</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {branchData.map((branch, idx) => (
                                <TableRow key={idx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 1 } }}>
                                    <TableCell sx={{ fontWeight: "700", color: "#111827" }}>{branch.branchName}</TableCell>
                                    <TableCell align="center">{branch.location}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{branch.transactions}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600", color: "#10B981" }}>{formatCurrency(branch.revenue)}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{formatCurrency(branch.avgTransaction)}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{branch.staffCount}</TableCell>
                                    <TableCell align="center" sx={{ borderRight: "none" }}>
                                        <Box sx={{ px: 1, py: 0.5, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#10B981", fontWeight: "600", fontSize: "0.75rem" }}>
                                            {branch.status}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Staff Performance Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "0px !important", overflowX: 'auto', boxShadow: "none" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.85rem", py: 1.5 } }}>
                                <TableCell align="center">STAFF MEMBER</TableCell>
                                <TableCell align="center">ROLE</TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        BRANCH <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">TRANSACTIONS</TableCell>
                                <TableCell align="center">REVENUE (FRW)</TableCell>
                                <TableCell align="center">AVG / TRANSACTION</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staffData.map((staff, idx) => (
                                <TableRow key={idx} sx={{ bgcolor: "white", '& td': { borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: "0.8rem", py: 1 } }}>
                                    <TableCell sx={{ fontWeight: "700", color: "#111827" }}>{staff.staffName}</TableCell>
                                    <TableCell align="center">{staff.role}</TableCell>
                                    <TableCell align="center">{staff.branch}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{staff.transactions}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600", color: "#10B981" }}>{formatCurrency(staff.revenue)}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "600" }}>{formatCurrency(Math.round(staff.revenue / staff.transactions))}</TableCell>
                                    <TableCell align="center" sx={{ borderRight: "none" }}>
                                        <Box sx={{ px: 1, py: 0.5, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#10B981", fontWeight: "600", fontSize: "0.75rem" }}>
                                            {staff.status}
                                        </Box>
                                    </TableCell>
                                </TableRow>
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
                    <MenuItem onClick={() => handleActorSelect('All')}>All Staff</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleActorSelect('Jean Pierre')}>Jean Pierre</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Sarah Smith')}>Sarah Smith</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Emmanuel R.')}>Emmanuel R.</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Marie Claire')}>Marie Claire</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Alice')}>Alice</MenuItem>
                    <MenuItem onClick={() => handleActorSelect('Bob')}>Bob</MenuItem>
                </Menu>
            </Box>
        </Fade>
    );
};

export default StaffTab;
