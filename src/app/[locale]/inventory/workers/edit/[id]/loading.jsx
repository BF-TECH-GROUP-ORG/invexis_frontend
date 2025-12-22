"use client";
import { Box, Skeleton, Grid } from "@mui/material";

export default function Loading() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "32px",
                paddingBottom: "32px",
            }}
            className="border-2 border-gray-200 rounded-xl"
        >
            <div className="flex w-full items-center">
                {/* Left Side: Form Fields */}
                <Box
                    sx={{
                        flex: 1,
                        p: { xs: 4, md: 6 },
                        bgcolor: "white",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Skeleton variant="text" width={200} height={40} />
                        <Skeleton variant="text" width={300} height={20} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width={150} height={20} sx={{ mt: 1 }} />
                    </Box>

                    {/* Form Fields Skeleton */}
                    <Box sx={{ flexGrow: 1, minHeight: 420, display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Skeleton variant="text" width={180} height={32} />
                        <div className="flex gap-4 w-full">
                            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                        </div>
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                    </Box>

                    {/* Footer Buttons */}
                    <Box
                        sx={{
                            mt: 6,
                            pt: 4,
                            borderTop: "1px solid #e0e0e0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 3 }} />
                        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 3 }} />
                    </Box>
                </Box>

                {/* Right Side: Stepper */}
                <Box
                    sx={{
                        width: { xs: "100%", lg: 500 },
                        borderTop: { xs: "1px solid #e0e0e0", lg: "none" },
                        py: { xs: 4, lg: 6 },
                        px: { xs: 2, lg: 0 },
                        display: { xs: "none", lg: "block" }
                    }}
                >
                    <Box sx={{ px: 4 }}>
                        {[1, 2, 3].map((i) => (
                            <Box key={i} sx={{ display: "flex", mb: 4 }}>
                                <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                                <Box>
                                    <Skeleton variant="text" width={120} height={24} />
                                    <Skeleton variant="text" width={180} height={20} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </div>
        </div>
    );
}
