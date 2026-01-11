import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Avatar, Typography, Fade } from '@mui/material';
import ReportKPI from './ReportKPI';
import ReportTable from './ReportTable';
import GroupIcon from '@mui/icons-material/Group';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import analyticsService from '@/services/analyticsService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

const StaffTab = ({ dateRange }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [staffPerformance, setStaffPerformance] = useState([]);
    const [shopPerformance, setShopPerformance] = useState([]);

    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setTimeout(() => {
                const mockStaff = [
                    { employeeName: 'Jean Pierre', orderCount: 145, totalSales: 12500000 },
                    { employeeName: 'Sarah Smith', orderCount: 132, totalSales: 11200000 },
                    { employeeName: 'Emmanuel R.', orderCount: 98, totalSales: 8400000 },
                    { employeeName: 'Marie Claire', orderCount: 85, totalSales: 7200000 },
                    { employeeName: 'John Doe', orderCount: 72, totalSales: 5600000 },
                ];

                const mockShops = [
                    { shopName: 'Kigali Heights', orderCount: 450, totalRevenue: 35000000 },
                    { shopName: 'Downtown Branch', orderCount: 380, totalRevenue: 28000000 },
                    { shopName: 'Nyarutarama Store', orderCount: 220, totalRevenue: 15000000 },
                    { shopName: 'Gikondo Depot', orderCount: 180, totalRevenue: 12000000 },
                ];

                setStaffPerformance(mockStaff);
                setShopPerformance(mockShops);
                setLoading(false);
            }, 800);
        };

        fetchData();
    }, [companyId, dateRange]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const staffColumns = [
        {
            field: 'name',
            label: 'Staff Member',
            render: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#FF6D00", fontSize: "0.9rem", fontWeight: "700" }}>
                        {row.employeeName?.charAt(0) || "U"}
                    </Avatar>
                    <Typography variant="body2" fontWeight="700" sx={{ color: "#374151" }}>
                        {row.employeeName || "Unknown"}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'orderCount', label: 'Transactions', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="600">{row.orderCount}</Typography>
            )
        },
        {
            field: 'totalSales', label: 'Revenue Generated', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="800" sx={{ color: "#111827" }}>
                    {parseFloat(row.totalSales).toLocaleString()} FRW
                </Typography>
            )
        }
    ];

    const shopColumns = [
        {
            field: 'shopName', label: 'Branch Name', render: (row) => (
                <Typography variant="body2" fontWeight="700" sx={{ color: "#374151" }}>
                    {row.shopName}
                </Typography>
            )
        },
        {
            field: 'orderCount', label: 'Transactions', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="600">{row.orderCount}</Typography>
            )
        },
        {
            field: 'totalRevenue', label: 'Total Revenue', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="800" sx={{ color: "#111827" }}>
                    {parseFloat(row.totalRevenue).toLocaleString()} FRW
                </Typography>
            )
        }
    ];

    const topPerformer = staffPerformance.length > 0
        ? staffPerformance.reduce((prev, current) => (parseFloat(prev.totalSales) > parseFloat(current.totalSales)) ? prev : current)
        : null;

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 0, sm: 3 }} sx={{ mb: 4, width: '100%', m: 0 }}>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Total Staff"
                            value={staffPerformance.length}
                            icon={GroupIcon}
                            color="#111827"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Active Branches"
                            value={shopPerformance.length}
                            icon={StoreIcon}
                            color="#FF6D00"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Top Performer"
                            value={topPerformer?.employeeName || "N/A"}
                            subValue={topPerformer ? `${parseFloat(topPerformer.totalSales).toLocaleString()} FRW` : ""}
                            icon={StarIcon}
                            color="#F59E0B"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Avg Rev/Staff"
                            value={staffPerformance.length > 0
                                ? `${(staffPerformance.reduce((sum, s) => sum + parseFloat(s.totalSales), 0) / staffPerformance.length).toLocaleString(undefined, { maximumFractionDigits: 0 })} FRW`
                                : "0 FRW"}
                            icon={TrendingUpIcon}
                            color="#10B981"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <ReportTable
                        title="Staff Performance"
                        columns={staffColumns}
                        data={staffPerformance}
                        onExport={() => console.log("Export Staff")}
                    />
                </Box>
                <Box sx={{ width: '100%', mb: 4 }}>
                    <ReportTable
                        title="Branch Performance"
                        columns={shopColumns}
                        data={shopPerformance}
                        onExport={() => console.log("Export Branches")}
                    />
                </Box>
            </Box>
        </Fade>
    );
};

export default StaffTab;
