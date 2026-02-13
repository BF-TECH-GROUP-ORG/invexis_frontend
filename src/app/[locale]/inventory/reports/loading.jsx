
import React from 'react';
import { Box, Typography, Tabs, Tab, Paper, Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';

export default function ReportsLoading() {
    return (
        <Box sx={{ width: '100%', minHeight: '100vh', animateIn: 'fade-in', duration: 500 }}>
            {/* Header Section */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 4,
                gap: 3,
                pt: { xs: 3, sm: 0 }
            }}>
                <Box>
                    <Skeleton variant="text" sx={{ fontSize: '2.25rem', width: 400, mb: 1 }} />
                    <Skeleton variant="text" sx={{ fontSize: '1rem', width: 300 }} />
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: '24px' }} />
                    <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: '8px' }} />
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Paper elevation={0} sx={{ mb: 4, border: "1px solid #e5e7eb", borderRadius: 0 }}>
                <Tabs value={0} variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}>
                    {[...Array(6)].map((_, i) => (
                        <Tab key={i} label={<Skeleton width={100} />} disabled />
                    ))}
                </Tabs>
            </Paper>

            {/* Tab Content Skeleton */}
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 6 }}>
                    {[...Array(4)].map((_, i) => (
                        <Box key={i} sx={{ p: 3, border: '1px solid #f3f4f6', borderRadius: '16px' }}>
                            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="80%" height={40} />
                        </Box>
                    ))}
                </Box>

                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px', mb: 4 }} />
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '12px' }} />
            </Box>
        </Box>
    );
}
