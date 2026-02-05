"use client";

import React, { useState, useEffect } from 'react';
import {
    IconButton, Collapse, Fade, Menu, MenuItem, Button, Box, Grid, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, Typography, Divider, Stack, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Warehouse,
    Package,
    ArrowDownRight
} from 'lucide-react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSession } from 'next-auth/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const InventoryTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);

    // Header Selection State
    const [selectedBranch, setSelectedBranch] = useState('All');

    // Menu Anchors
    const [branchAnchor, setBranchAnchor] = useState(null);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockSummary = {
                    totalValue: 85400000,
                    totalItems: 12450,
                    lowStockCount: 18,
                    outOfStockCount: 5
                };

                const allMockData = [
                    {
                        date: '02/15/2022',
                        shops: [
                            {
                                name: 'North Branch',
                                products: [
                                    {
                                        name: 'iPhone 15 Pro Max',
                                        category: 'Electronics',
                                        movement: { open: 50, in: 20, out: 15, close: 55 },
                                        value: { unitCost: 1200000, totalValue: 66000000 },
                                        status: { reorder: 10, status: 'In Stock', age: 12 },
                                        tracking: { lastRestock: '02/01/2022', lastMove: '02/14/2022' }
                                    },
                                    {
                                        name: 'Samsung 65" OLED TV',
                                        category: 'Electronics',
                                        movement: { open: 5, in: 0, out: 5, close: 0 },
                                        value: { unitCost: 2500000, totalValue: 0 },
                                        status: { reorder: 5, status: 'Out of Stock', age: 45 },
                                        tracking: { lastRestock: '01/15/2022', lastMove: '02/15/2022' }
                                    }
                                ]
                            },
                            {
                                name: 'South Branch',
                                products: [
                                    {
                                        name: 'MacBook Air M2',
                                        category: 'Electronics',
                                        movement: { open: 10, in: 5, out: 12, close: 3 },
                                        value: { unitCost: 1500000, totalValue: 4500000 },
                                        status: { reorder: 8, status: 'Low Stock', age: 8 },
                                        tracking: { lastRestock: '02/10/2022', lastMove: '02/15/2022' }
                                    }
                                ]
                            }
                        ]
                    }
                ];

                // Filter by selected branch
                let filteredData = allMockData.map(day => {
                    if (selectedBranch === 'None') return { ...day, shops: [] };
                    if (selectedBranch === 'All') return day;
                    const filteredShops = day.shops.filter(shop => shop.name === selectedBranch);
                    return { ...day, shops: filteredShops };
                });

                setSummary(mockSummary);
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



    const kpiCards = [
        {
            title: "Total Stock Value",
            value: formatCurrency(summary?.totalValue || 0),
            icon: TrendingUp,
            color: "#FF6D00",
        },
        {
            title: "Total Items",
            value: summary?.totalItems || 0,
            icon: Warehouse,
            color: "#0059ffff",
        },
        {
            title: "Low Stock Items",
            value: summary?.lowStockCount || 0,
            icon: TrendingDown,
            color: "#F59E0B",
            trend: "down",
            trendValue: "Action Needed",
        },
        {
            title: "Out of Stock",
            value: summary?.outOfStockCount || 0,
            icon: Package,
            color: "#EF4444",
            trend: "down",
            trendValue: "Critical",
        },
    ];


    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: "#f9fafb" }}>
                {/* Header with Title, Toggle, Date Picker, and Export Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Typography variant="h5" align="left" fontWeight="700" sx={{ color: "#111827", whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                        Inventory Report
                    </Typography>


                </Box>

                {/* Top KPIs */}


                <div className="w-full py-4">
                    <div className="w-full grid grid-cols-4 gap-3">
                        {kpiCards.map((card, index) => (
                            <div
                                key={index}
                                style={{ "--hover-color": card.color }}
                                className="
                    group
                    border-2 border-gray-300
                    flex justify-between px-4 py-6
                    rounded-2xl
                    transition-all duration-300 ease-in-out
                    hover:border-[var(--hover-color)]
                "
                            >
                                <div>
                                    <h2 className="text-md text-gray-600 font-semibold">
                                        {card.title}
                                    </h2>
                                    <p className="text-xl font-bold">
                                        {card.value}
                                    </p>
                                </div>

                                <div
                                    className="p-2 rounded-lg w-12 h-12 flex items-center justify-center"
                                    style={{
                                        backgroundColor: `${card.color}20`,
                                        color: card.color
                                    }}
                                >
                                    <card.icon size={24} />
                                </div>
                            </div>
                        ))}
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
                                        'Date'
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={handleBranchClick}>
                                        {selectedBranch === 'All' ? 'Branch' : selectedBranch} <ArrowDropDownIcon sx={{ ml: 0.5 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">Product Name</TableCell>
                                <TableCell align="center">Category</TableCell>
                                <TableCell align="center" colSpan={4}>Inventory Movement</TableCell>
                                <TableCell align="center" colSpan={2}>Inventory Value</TableCell>
                                <TableCell align="center" colSpan={3}>Stock Status</TableCell>
                                <TableCell align="center" colSpan={2}>Tracking</TableCell>
                            </TableRow>
                            {/* Sub Headers */}
                            <TableRow sx={{ bgcolor: "#333", '& th': { borderRight: "1px solid #bbadadff", color: "white", fontWeight: "700", fontSize: "0.7rem", py: 0.5 } }}>
                                <TableCell colSpan={4} sx={{ borderRight: "1px solid #444" }} />
                                <TableCell align="center">Open</TableCell>
                                <TableCell align="center">In</TableCell>
                                <TableCell align="center">Out</TableCell>
                                <TableCell align="center">Close</TableCell>
                                <TableCell align="center">Unit Cost</TableCell>
                                <TableCell align="center">Total Value</TableCell>
                                <TableCell align="center">Reorder</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Age(D)</TableCell>
                                <TableCell align="center">Last Restock</TableCell>
                                <TableCell align="center" sx={{ borderRight: "none" }}>Last Move</TableCell>
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
                                                    <TableCell align="center">{product.category}</TableCell>
                                                    <TableCell align="center">{product.movement.open}</TableCell>
                                                    <TableCell align="center">{product.movement.in}</TableCell>
                                                    <TableCell align="center">{product.movement.out}</TableCell>
                                                    <TableCell align="center">{product.movement.close}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.value.unitCost)}</TableCell>
                                                    <TableCell align="center">{formatCurrency(product.value.totalValue)}</TableCell>
                                                    <TableCell align="center">{product.status.reorder}</TableCell>
                                                    <TableCell align="center">
                                                        <Box component="span" sx={{
                                                            px: 1.5, py: 0.5, borderRadius: "20px",
                                                            bgcolor: product.status.status === 'Out of Stock' ? '#FEF2F2' : product.status.status === 'Low Stock' ? '#FFFBEB' : '#F0FDF4',
                                                            color: product.status.status === 'Out of Stock' ? '#DC2626' : product.status.status === 'Low Stock' ? '#D97706' : '#16A34A',
                                                            fontWeight: '700', fontSize: '0.7rem',
                                                            border: `1px solid ${product.status.status === 'Out of Stock' ? '#FEE2E2' : product.status.status === 'Low Stock' ? '#FEF3C7' : '#DCFCE7'}`
                                                        }}>
                                                            {product.status.status}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">{product.status.age}</TableCell>
                                                    <TableCell align="center">{product.tracking.lastRestock}</TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "none" }}>{product.tracking.lastMove}</TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Spacer Row */}
                                            <TableRow sx={{ height: 8 }}><TableCell colSpan={15} sx={{ border: "none" }} /></TableRow>
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

export default InventoryTab;
