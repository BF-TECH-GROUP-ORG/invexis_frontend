"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function Loading() {
    return (
        <div className="p-4 space-y-8 w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* CRM Directory Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                </div>

                {/* Filters Row Skeleton */}
                <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg ml-auto" />
                </div>

                {/* Table Placeholder */}
                <div className="space-y-4">
                    <div className="h-[1px] bg-slate-100 w-full" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-6 py-4">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-1/6" />
                            </div>
                            <div className="w-48 space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                            <div className="w-32">
                                <Skeleton className="h-4 w-full font-mono" />
                            </div>
                            <Skeleton className="w-24 h-8 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
