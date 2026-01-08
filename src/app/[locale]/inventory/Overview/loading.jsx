"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-sans animate-in fade-in duration-500">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center px-2">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="w-32 h-12 rounded-2xl" />
                </div>

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>

                {/* Main Charts & Analytics Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-8 w-32 rounded-xl" />
                        </div>
                        <Skeleton className="h-[350px] w-full rounded-2xl" />
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex justify-center py-8">
                            <Skeleton className="w-56 h-56 rounded-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                </div>

                {/* Detailed Insights Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-2xl" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="flex justify-between py-3 border-b border-slate-50 last:border-0 items-center">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                        <Skeleton className="h-6 w-16 rounded-full" />
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
