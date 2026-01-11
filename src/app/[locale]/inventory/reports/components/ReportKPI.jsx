import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ReportKPI = ({
    title,
    value,
    subValue,
    icon: Icon,
    trend, // 'up' | 'down' | 'neutral'
    trendValue,
    color = "#FF6D00", // Default Orange
    index = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ height: '100%' }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: "2px solid #e5e7eb",
                    bgcolor: "white",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.3s ease",
                    boxShadow: "none",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: color,
                        boxShadow: "none"
                    }
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.75rem", display: "block", mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ color: "#111827" }}>
                        {value}
                    </Typography>

                    {(subValue || trendValue) && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            {trend && (
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: trend === 'up' ? "success.main" : trend === 'down' ? "error.main" : "text.secondary",
                                    bgcolor: trend === 'up' ? "success.lighter" : trend === 'down' ? "error.lighter" : "grey.100",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: "6px"
                                }}>
                                    {trend === 'up' ? <TrendingUp size={14} style={{ marginRight: 4 }} /> :
                                        trend === 'down' ? <TrendingDown size={14} style={{ marginRight: 4 }} /> : null}
                                    <Typography variant="caption" fontWeight="700">
                                        {trendValue}
                                    </Typography>
                                </Box>
                            )}
                            {subValue && (
                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                    {subValue}
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Box>

                {Icon && (
                    <Box sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: `${color}15`, // 15% opacity
                        color: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Icon size={24} />
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
};

export default ReportKPI;
