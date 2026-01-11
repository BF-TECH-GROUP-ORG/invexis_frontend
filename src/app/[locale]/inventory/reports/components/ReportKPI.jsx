import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ReportKPI = ({
    title,
    value,
    subValue,
    icon: Icon,
    trend, // 'up' | 'down' | 'neutral'
    trendValue,
    color = "#FF6D00" // Default Orange
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: { xs: 0, sm: "20px" },
                border: "1px solid #e5e7eb",
                borderLeft: { xs: "none", sm: "1px solid #e5e7eb" },
                borderRight: { xs: "none", sm: "1px solid #e5e7eb" },
                bgcolor: "white",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                "&:hover": {
                    transform: { xs: "none", sm: "translateY(-4px)" },
                    boxShadow: { xs: "none", sm: "0 12px 24px -10px rgba(0,0,0,0.08)" },
                    borderColor: "#FF6D0030"
                }
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="600" sx={{ textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.75rem" }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ color: "#111827", mt: 1 }}>
                        {value}
                    </Typography>
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
                        <Icon sx={{ fontSize: 24 }} />
                    </Box>
                )}
            </Box>

            {(subValue || trendValue) && (
                <Stack direction="row" alignItems="center" spacing={1}>
                    {trend && (
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            color: trend === 'up' ? "success.main" : trend === 'down' ? "error.main" : "text.secondary",
                            bgcolor: trend === 'up' ? "success.lighter" : trend === 'down' ? "error.lighter" : "grey.100",
                            px: 0.5,
                            py: 0.25,
                            borderRadius: "4px"
                        }}>
                            {trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> :
                                trend === 'down' ? <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} /> : null}
                            <Typography variant="caption" fontWeight="700">
                                {trendValue}
                            </Typography>
                        </Box>
                    )}
                    {subValue && (
                        <Typography variant="body2" color="text.secondary">
                            {subValue}
                        </Typography>
                    )}
                </Stack>
            )}
        </Paper>
    );
};

export default ReportKPI;
