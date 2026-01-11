"use client";

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Button,
    Menu,
    MenuItem,
    IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryTab from './components/InventoryTab';
import SalesTab from './components/SalesTab';
import DebtsTab from './components/DebtsTab';
import PaymentsTab from './components/PaymentsTab';
import StaffTab from './components/StaffTab';
import GeneralTab from './components/GeneralTab';
import dayjs from 'dayjs';

const ReportsPage = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [anchorEl, setAnchorEl] = useState(null);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleDateMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleDateMenuClose = () => setAnchorEl(null);

    const handlePresetDate = (days) => {
        setDateRange({
            startDate: dayjs().subtract(days, 'day'),
            endDate: dayjs()
        });
        handleDateMenuClose();
    };

    return (
        <Box sx={{
            width: '100%',
            minHeight: '100vh',
            bgcolor: "#f9fafb"
        }}>
            {/* Header Section */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 4,
                gap: 3,
                px: { xs: 2, sm: 0 },
                pt: { xs: 3, sm: 0 }
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{
                        color: "#111827",
                        letterSpacing: "-1px",
                        fontSize: { xs: "1.75rem", md: "2.25rem" }
                    }}>
                        System-Wide Reports & Analytics
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                        Consolidated insights across all your business operations to keep you informed and empowered.
                    </Typography>
                </Box>

                <Box sx={{
                    display: "flex",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                    flexWrap: "wrap"
                }}>
                    {/* Date Filter */}
                    <Button
                        variant="outlined"
                        startIcon={<CalendarTodayIcon />}
                        onClick={handleDateMenuOpen}
                        sx={{
                            flex: { xs: 1, sm: "none" },
                            borderColor: "#e5e7eb",
                            color: "#374151",
                            textTransform: "none",
                            fontWeight: "600",
                            bgcolor: "white",
                            borderRadius: "10px",
                            px: 2,
                            "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" }
                        }}
                    >
                        {dateRange.startDate ? `${dayjs(dateRange.startDate).format('MMM D')} - ${dayjs(dateRange.endDate).format('MMM D')}` : "Last 30 Days"}
                    </Button>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleDateMenuClose}>
                        <MenuItem onClick={() => handlePresetDate(7)}>Last 7 Days</MenuItem>
                        <MenuItem onClick={() => handlePresetDate(30)}>Last 30 Days</MenuItem>
                        <MenuItem onClick={() => handlePresetDate(90)}>Last 90 Days</MenuItem>
                        <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>Custom Range</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <DatePicker
                                        label="Start Date"
                                        value={dateRange.startDate}
                                        onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
                                        slotProps={{ textField: { size: 'small' } }}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={dateRange.endDate}
                                        onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
                                        slotProps={{ textField: { size: 'small' } }}
                                    />
                                </Box>
                            </LocalizationProvider>
                        </Box>
                    </Menu>

                    {/* Global Actions */}
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{
                            flex: { xs: 1, sm: "none" },
                            bgcolor: "#FF6D00",
                            color: "white",
                            fontWeight: "700",
                            textTransform: "none",
                            borderRadius: "10px",
                            px: 3,
                            boxShadow: "0 4px 14px 0 rgba(255, 109, 0, 0.39)",
                            "&:hover": { bgcolor: "#E65100", boxShadow: "0 6px 20px rgba(255, 109, 0, 0.23)" }
                        }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    bgcolor: "white",
                    borderRadius: { xs: 0, sm: "16px" },
                    border: "1px solid #e5e7eb",
                    borderLeft: { xs: "none", sm: "1px solid #e5e7eb" },
                    borderRight: { xs: "none", sm: "1px solid #e5e7eb" },
                    overflow: "hidden"
                }}
            >
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1,
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: "600",
                            fontSize: "0.95rem",
                            color: "#6b7280",
                            minHeight: 60,
                            px: 3,
                            "&.Mui-selected": { color: "#FF6D00" }
                        },
                        "& .MuiTabs-indicator": {
                            bgcolor: "#FF6D00",
                            height: 3,
                            borderRadius: "3px"
                        }
                    }}
                >
                    <Tab label="General Overview" />
                    <Tab label="Inventory Analysis" />
                    <Tab label="Sales Performance" />
                    <Tab label="Debts & Credit" />
                    <Tab label="Payment Methods" />
                    <Tab label="Staff & Branches" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box sx={{ width: '100%', px: { xs: 0, sm: 0 } }}>
                {currentTab === 0 && <GeneralTab dateRange={dateRange} />}
                {currentTab === 1 && <InventoryTab dateRange={dateRange} />}
                {currentTab === 2 && <SalesTab dateRange={dateRange} />}
                {currentTab === 3 && <DebtsTab dateRange={dateRange} />}
                {currentTab === 4 && <PaymentsTab dateRange={dateRange} />}
                {currentTab === 5 && <StaffTab dateRange={dateRange} />}
            </Box>
        </Box>
    );
};

export default ReportsPage;
