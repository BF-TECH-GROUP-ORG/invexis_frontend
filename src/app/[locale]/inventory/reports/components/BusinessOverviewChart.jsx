import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Helper to generate mock daily data (24 hours)
const generateHourlyData = (date) => {
    return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        hourNum: i,
        netSales: Math.floor(Math.random() * 30000) + 5000,
        paymentsReceived: Math.floor(Math.random() * 25000) + 4000,
        outstandingDebts: Math.floor(Math.random() * 20000) + 3000,
        inventoryValue: Math.floor(Math.random() * 60000) + 30000,
    }));
};

// Helper to generate mock weekly data (7 days)
const generateWeeklyData = (date) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return daysOfWeek.map((day, index) => ({
        day: day.slice(0, 3),
        fullDay: day,
        netSales: Math.floor(Math.random() * 200000) + 50000,
        paymentsReceived: Math.floor(Math.random() * 180000) + 40000,
        outstandingDebts: Math.floor(Math.random() * 150000) + 30000,
        inventoryValue: Math.floor(Math.random() * 300000) + 150000,
    }));
};

// Helper to generate mock monthly data (30 days)
const generateMonthlyData = (date) => {
    const daysInMonth = date.daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        netSales: Math.floor(Math.random() * 50000) + 10000,
        paymentsReceived: Math.floor(Math.random() * 40000) + 8000,
        outstandingDebts: Math.floor(Math.random() * 30000) + 5000,
        inventoryValue: Math.floor(Math.random() * 100000) + 50000,
    }));
};

// Helper to generate mock yearly data (12 months)
const generateYearlyData = (year) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
        month: month,
        monthNum: index + 1,
        netSales: Math.floor(Math.random() * 1500000) + 300000,
        paymentsReceived: Math.floor(Math.random() * 1200000) + 250000,
        outstandingDebts: Math.floor(Math.random() * 1000000) + 200000,
        inventoryValue: Math.floor(Math.random() * 3000000) + 1500000,
    }));
};

const COLORS = {
    netSales: '#F97316',
    paymentsReceived: '#1E293B',
    outstandingDebts: '#78350F',
    inventoryValue: '#FDBA74',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    bgcolor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 0,
                    boxShadow: 'none',
                }}
            >
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#111827' }}>
                    {label}
                </Typography>
                {payload.map((entry, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, bgcolor: entry.color, borderRadius: '2px' }} />
                        <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: '600' }}>
                            {entry.name === 'netSales' ? 'Net Sales' :
                                entry.name === 'paymentsReceived' ? 'Payments Received' :
                                    entry.name === 'outstandingDebts' ? 'Outstanding Debts' :
                                        'Inventory Value'}:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#111827', fontWeight: '700', ml: 'auto' }}>
                            {entry.value.toLocaleString()} FRW
                        </Typography>
                    </Box>
                ))}
            </Paper>
        );
    }
    return null;
};

const BusinessOverviewChart = ({ reportView = 'monthly' }) => {
    const [viewType, setViewType] = useState(reportView || 'monthly'); // 'daily', 'weekly', 'monthly', 'yearly'
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedYear, setSelectedYear] = useState(dayjs().year());

    // Update viewType when reportView prop changes
    React.useEffect(() => {
        if (reportView) {
            setViewType(reportView);
        }
    }, [reportView]);

    const chartData = useMemo(() => {
        switch (viewType) {
            case 'daily':
                return generateHourlyData(selectedDate);
            case 'weekly':
                return generateWeeklyData(selectedDate);
            case 'yearly':
                return generateYearlyData(selectedYear);
            case 'monthly':
            default:
                return generateMonthlyData(selectedDate);
        }
    }, [viewType, selectedDate, selectedYear]);

    const getTitle = () => {
        switch (viewType) {
            case 'daily':
                return `Daily Breakdown for ${selectedDate.format('MMMM DD, YYYY')}`;
            case 'weekly':
                return `Weekly Breakdown for ${selectedDate.format('MMMM YYYY')}`;
            case 'yearly':
                return `Yearly Breakdown for ${selectedYear}`;
            case 'monthly':
            default:
                return `Monthly Breakdown for ${selectedDate.format('YYYY')}`;
        }
    };

    const getSubtitle = () => {
        switch (viewType) {
            case 'daily':
                return 'Performance by hour (24-hour breakdown)';
            case 'weekly':
                return 'Performance by day of week';
            case 'yearly':
                return 'Performance by month across the year';
            case 'monthly':
            default:
                return 'Performance by day of month';
        }
    };

    const getXAxisDataKey = () => {
        switch (viewType) {
            case 'daily':
                return 'hour';
            case 'weekly':
                return 'day';
            case 'yearly':
                return 'month';
            case 'monthly':
            default:
                return 'day';
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                p: 4,
                borderRadius: 0,
                border: '1px solid #e5e7eb',
                bgcolor: 'white',
                mb: 4,
                boxShadow: 'none'
            }}
        >
            {/* Header with Title and Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#111827' }}>
                        Business Performance Overview
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: '600' }}>
                        {getSubtitle()}
                    </Typography>
                </Box>

                {/* View Type Toggle Buttons */}
                <ToggleButtonGroup
                    value={viewType}
                    exclusive
                    onChange={(event, newViewType) => {
                        if (newViewType !== null) {
                            setViewType(newViewType);
                        }
                    }}
                    sx={{
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            px: 2,
                            py: 0.75,
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
                    <ToggleButton value="weekly">Weekly</ToggleButton>
                    <ToggleButton value="monthly">Monthly</ToggleButton>
                    <ToggleButton value="yearly">Yearly</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Date/Year Selectors */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                {viewType === 'yearly' ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            views={['year']}
                            label="Select Year"
                            value={dayjs().year(selectedYear)}
                            onChange={(newValue) => setSelectedYear(newValue.year())}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    sx: {
                                        width: 150,
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
                    </LocalizationProvider>
                ) : viewType === 'daily' ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    sx: {
                                        width: 150,
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
                    </LocalizationProvider>
                ) : (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            views={['year', 'month']}
                            label="Select Month"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    sx: {
                                        width: 150,
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
                    </LocalizationProvider>
                )}
            </Box>

            {/* Chart Title */}
            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 3, color: '#374151' }}>
                {getTitle()}
            </Typography>

            {/* Chart */}
            <Box sx={{ height: 450, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={viewType === 'weekly' ? 8 : 2}
                        barCategoryGap={viewType === 'weekly' ? '12%' : '8%'}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey={getXAxisDataKey()}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: '600' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: '600' }}
                            tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${value / 1000}K` : value}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="rect"
                            iconSize={12}
                            wrapperStyle={{ paddingTop: '40px' }}
                            formatter={(value) => (
                                <span style={{ color: '#374151', fontWeight: '600', fontSize: '13px', marginLeft: '6px', marginRight: '20px' }}>
                                    {value === 'netSales' ? 'Net Sales' :
                                        value === 'paymentsReceived' ? 'Payments Received' :
                                            value === 'outstandingDebts' ? 'Outstanding Debts' :
                                                'Inventory Value'}
                                </span>
                            )}
                        />
                        <Bar
                            dataKey="netSales"
                            name="netSales"
                            fill={COLORS.netSales}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                        <Bar
                            dataKey="paymentsReceived"
                            name="paymentsReceived"
                            fill={COLORS.paymentsReceived}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                        <Bar
                            dataKey="outstandingDebts"
                            name="outstandingDebts"
                            fill={COLORS.outstandingDebts}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                        <Bar
                            dataKey="inventoryValue"
                            name="inventoryValue"
                            fill={COLORS.inventoryValue}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default BusinessOverviewChart;
