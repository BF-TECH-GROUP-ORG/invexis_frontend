"use client";
import { Skeleton } from "@mui/material";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 3 }} />
                    <div>
                        <Skeleton variant="text" width={200} height={32} />
                        <Skeleton variant="text" width={250} height={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Skeleton */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <Skeleton variant="text" width={100} height={24} />
                        </div>
                        <div className="p-2 space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area Skeleton */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
                            <div>
                                <Skeleton variant="text" width={180} height={28} />
                                <Skeleton variant="text" width={220} height={20} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
