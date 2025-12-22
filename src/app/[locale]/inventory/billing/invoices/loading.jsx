"use client";
import { Skeleton } from "@mui/material";

export default function Loading() {
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={20} />
                </div>
            </div>

            {/* Explorer Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
                {/* Explorer Header */}
                <div className="flex justify-between items-center mb-4">
                    <Skeleton variant="text" width={150} height={32} />
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton variant="text" width={80} height={20} />
                </div>

                {/* Grid View (Years/Months) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200">
                            <Skeleton variant="rectangular" width={48} height={48} sx={{ mb: 1, borderRadius: 1 }} />
                            <Skeleton variant="text" width={60} height={24} />
                            <Skeleton variant="text" width={40} height={16} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
