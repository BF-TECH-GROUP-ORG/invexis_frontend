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
                    p: 2.5,
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    bgcolor: "white",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.3s ease",
                    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
                    "&:hover": {
                        borderColor: color,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                        transform: "translateY(-2px)"
                    }
                }}
            >
                {/* Header Section: Title + Icon */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        fontWeight="600" 
                        sx={{ 
                            textTransform: "uppercase", 
                            letterSpacing: "0.3px", 
                            fontSize: "0.7rem",
                            color: "#6b7280"
                        }}
                    >
                        {title}
                    </Typography>

                    {Icon && (
                        <Box sx={{
                            p: 1,
                            borderRadius: "8px",
                            bgcolor: `${color}12`, // 12% opacity
                            color: color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "36px",
                            minHeight: "36px"
                        }}>
                            <Icon sx={{ fontSize: "20px" }} />
                        </Box>
                    )}
                </Box>

                {/* Value Section */}
                <Box sx={{ mb: 1 }}>
                    <Typography 
                        variant="h6" 
                        fontWeight="800" 
                        sx={{ 
                            color: "#111827",
                            fontSize: "1.35rem",
                            lineHeight: "1.2"
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                {/* Trend/SubValue Section */}
                {(subValue || trendValue) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {trend && (
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: trend === 'up' ? "#10b981" : trend === 'down' ? "#ef4444" : "#6b7280",
                                bgcolor: trend === 'up' ? "#f0fdf4" : trend === 'down' ? "#fef2f2" : "#f3f4f6",
                                px: 1,
                                py: 0.25,
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "700"
                            }}>
                                {trend === 'up' ? <TrendingUp size={12} /> :
                                    trend === 'down' ? <TrendingDown size={12} /> : null}
                                {trendValue}
                            </Box>
                        )}
                        {subValue && (
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                fontWeight="500"
                                sx={{ fontSize: "0.75rem" }}
                            >
                                {subValue}
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
};

export default ReportKPI;
