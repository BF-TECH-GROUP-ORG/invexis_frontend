"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function Loading() {
    return (
        <div className="p-4 space-y-8 w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </div>

            {/* Explorer Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[400px]">
                {/* Explorer Header */}
                <div className="flex justify-between items-center mb-10">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                    </div>
                </div>

                {/* Breadcrumb Placeholder */}
                <div className="flex items-center gap-2 mb-12">
                    <Skeleton className="h-4 w-24" />
                    <span className="text-slate-200">/</span>
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Grid View Placeholder */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-50 transition-all">
                            <Skeleton className="w-14 h-14 rounded-2xl mb-4" />
                            <Skeleton className="h-5 w-3/4 mb-1.5" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
