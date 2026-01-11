import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Fade } from '@mui/material';
import ReportKPI from './ReportKPI';
import ReportTable from './ReportTable';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import reportService from '@/services/reportService';
import { useSession } from 'next-auth/react';

const InventoryTab = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [lowStock, setLowStock] = useState([]);

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

                const mockLowStock = [
                    { id: 1, name: 'iPhone 15 Pro Max', category: 'Electronics', quantity: 2, minQuantity: 10 },
                    { id: 2, name: 'Samsung 65" OLED TV', category: 'Electronics', quantity: 0, minQuantity: 5 },
                    { id: 3, name: 'MacBook Air M2', category: 'Electronics', quantity: 3, minQuantity: 8 },
                    { id: 4, name: 'Sony WH-1000XM5', category: 'Electronics', quantity: 1, minQuantity: 12 },
                    { id: 5, name: 'Logitech MX Master 3S', category: 'Accessories', quantity: 4, minQuantity: 15 },
                    { id: 6, name: 'Dell UltraSharp 27"', category: 'Electronics', quantity: 0, minQuantity: 4 },
                    { id: 7, name: 'Bose QuietComfort Ultra', category: 'Electronics', quantity: 2, minQuantity: 10 },
                ];

                setSummary(mockSummary);
                setLowStock(mockLowStock);
                setLoading(false);
            }, 800);
        };

        fetchData();
    }, [companyId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    const columns = [
        { field: 'name', label: 'Product Name' },
        { field: 'category', label: 'Category' },
        {
            field: 'quantity', label: 'Current Qty', align: 'right', render: (row) => (
                <Typography variant="body2" fontWeight="700" color={row.quantity === 0 ? "error.main" : row.quantity <= (row.minQuantity || 5) ? "warning.main" : "text.primary"}>
                    {row.quantity}
                </Typography>
            )
        },
        { field: 'minQuantity', label: 'Reorder Level', align: 'right' },
        {
            field: 'status',
            label: 'Status',
            align: 'right',
            render: (row) => (
                <Box component="span" sx={{
                    px: 1.5, py: 0.5, borderRadius: "20px",
                    bgcolor: row.quantity === 0 ? '#FEF2F2' : row.quantity <= (row.minQuantity || 5) ? '#FFFBEB' : '#F0FDF4',
                    color: row.quantity === 0 ? '#DC2626' : row.quantity <= (row.minQuantity || 5) ? '#D97706' : '#16A34A',
                    fontWeight: '700', fontSize: '0.7rem',
                    border: `1px solid ${row.quantity === 0 ? '#FEE2E2' : row.quantity <= (row.minQuantity || 5) ? '#FEF3C7' : '#DCFCE7'}`
                }}>
                    {row.quantity === 0 ? 'Out of Stock' : row.quantity <= (row.minQuantity || 5) ? 'Low Stock' : 'In Stock'}
                </Box>
            )
        }
    ];

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 0, sm: 3 }} sx={{ mb: 4, width: '100%', m: 0 }}>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Total Stock Value"
                            value={`${(summary?.totalValue || 0).toLocaleString()} FRW`}
                            icon={MonetizationOnIcon}
                            color="#FF6D00"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Total Items"
                            value={summary?.totalItems || 0}
                            icon={Inventory2Icon}
                            color="#3B82F6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Low Stock Items"
                            value={summary?.lowStockCount || 0}
                            icon={WarningIcon}
                            color="#F59E0B"
                            trend="down"
                            trendValue="Action Needed"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3} sx={{ mb: { xs: 2, sm: 0 } }}>
                        <ReportKPI
                            title="Out of Stock"
                            value={summary?.outOfStockCount || 0}
                            icon={ProductionQuantityLimitsIcon}
                            color="#EF4444"
                            trend="down"
                            trendValue="Critical"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <ReportTable
                        title="Low Stock & Critical Items"
                        columns={columns}
                        data={lowStock}
                        onExport={() => console.log("Export Inventory")}
                        onPrint={() => console.log("Print Inventory")}
                    />
                </Box>
            </Box>
        </Fade>
    );
};

export default InventoryTab;
