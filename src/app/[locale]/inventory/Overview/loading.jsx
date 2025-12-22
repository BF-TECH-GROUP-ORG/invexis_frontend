"use client";
import { Skeleton } from "@mui/material";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 md:p-8 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton variant="text" width={250} height={40} />
                        <Skeleton variant="text" width={180} height={24} sx={{ mt: 1 }} />
                    </div>
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                </div>

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200">
                            <Skeleton variant="text" width={120} height={20} />
                            <Skeleton variant="text" width={100} height={36} sx={{ mt: 1 }} />
                            <Skeleton variant="text" width={80} height={16} sx={{ mt: 1 }} />
                        </div>
                    ))}
                </div>

                {/* Distribution Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200">
                            <Skeleton variant="text" width={180} height={28} />
                            <Skeleton variant="circular" width={200} height={200} sx={{ mx: "auto", mt: 4 }} />
                        </div>
                    ))}
                </div>

                {/* Movement Trend Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200">
                    <Skeleton variant="text" width={200} height={28} />
                    <Skeleton variant="rectangular" width="100%" height={300} sx={{ mt: 4, borderRadius: 2 }} />
                </div>

                {/* Insights Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200">
                            <Skeleton variant="text" width={180} height={28} />
                            <Skeleton variant="rectangular" width="100%" height={250} sx={{ mt: 4, borderRadius: 2 }} />
                        </div>
                    ))}
                </div>

                {/* Product Risk Tables Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200">
                            <Skeleton variant="text" width={150} height={28} />
                            <div className="space-y-3 mt-4">
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <div key={j} className="flex justify-between items-center">
                                        <Skeleton variant="text" width={120} />
                                        <Skeleton variant="text" width={60} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
