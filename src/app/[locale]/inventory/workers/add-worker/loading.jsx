
import React from 'react';
import { Box, Paper, Skeleton, Stepper, Step, StepLabel, StepConnector, Typography } from "@mui/material";

export default function AddWorkerLoading() {
    return (
        <div className="flex items-center justify-center border-2 border-gray-200 rounded-xl bg-white min-h-[600px] animate-in fade-in duration-500">
            <div className="flex w-full items-stretch min-h-[600px]">
                {/* Main Form Area Skeleton */}
                <Box sx={{ flex: 1, p: { xs: 4, md: 6 }, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ mb: 4 }}>
                        <Skeleton variant="text" width={280} height={48} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width={400} height={24} sx={{ mb: 1 }} />
                        <div className="flex items-center gap-1">
                            <Skeleton variant="text" width={80} height={20} />
                            <span className="text-gray-300">/</span>
                            <Skeleton variant="text" width={80} height={20} />
                            <span className="text-gray-300">/</span>
                            <Skeleton variant="text" width={80} height={20} />
                        </div>
                    </Box>

                    <div className="flex-grow space-y-6">
                        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                        <div className="flex gap-4">
                            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '12px' }} />
                            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '12px' }} />
                        </div>
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: '12px' }} />
                    </div>

                    <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
                        <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: '12px' }} />
                    </Box>
                </Box>

                {/* Sidebar Stepper Skeleton (desktop) */}
                <Box sx={{
                    width: { xs: 0, lg: 500 },
                    display: { xs: 'none', lg: 'block' },
                    borderLeft: "1px solid #f0f0f0",
                    p: 6
                }}>
                    <Stepper orientation="vertical">
                        {[1, 2, 3].map((i) => (
                            <Step key={i}>
                                <StepLabel StepIconComponent={() => (
                                    <Skeleton variant="circular" width={44} height={44} />
                                )}>
                                    <div className="ml-4">
                                        <Skeleton variant="text" width={140} height={24} sx={{ mb: 0.5 }} />
                                        <Skeleton variant="text" width={200} height={16} />
                                    </div>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </div>
        </div>
    );
}
