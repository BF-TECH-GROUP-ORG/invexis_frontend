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
import { Box, Typography, Paper, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Helper to generate mock daily data
const generateDailyData = (date) => {
    const daysInMonth = date.daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        netSales: Math.floor(Math.random() * 50000) + 10000,
        paymentsReceived: Math.floor(Math.random() * 40000) + 8000,
        outstandingDebts: Math.floor(Math.random() * 30000) + 5000,
        inventoryValue: Math.floor(Math.random() * 100000) + 50000,
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
                    Day {label}
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

const BusinessOverviewChart = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const chartData = useMemo(() => generateDailyData(selectedDate), [selectedDate]);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#111827' }}>
                        Monthly Business Overview
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: '600' }}>
                        Daily performance breakdown for {selectedDate.format('MMMM YYYY')}
                    </Typography>
                </Box>

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
                                    width: 200,
                                    '& .MuiOutlinedInput-root': { borderRadius: 0 }
                                }
                            }
                        }}
                    />
                </LocalizationProvider>
            </Box>

            <Box sx={{ height: 450, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={2}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: '600' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: '600' }}
                            tickFormatter={(value) => value >= 1000 ? `${value / 1000}K` : value}
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
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="paymentsReceived"
                            name="paymentsReceived"
                            fill={COLORS.paymentsReceived}
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="outstandingDebts"
                            name="outstandingDebts"
                            fill={COLORS.outstandingDebts}
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="inventoryValue"
                            name="inventoryValue"
                            fill={COLORS.inventoryValue}
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default BusinessOverviewChart;
