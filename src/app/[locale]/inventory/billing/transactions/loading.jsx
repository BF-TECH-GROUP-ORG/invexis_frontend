"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function Loading() {
    return (
        <div className="p-4 space-y-8 w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>

            {/* Transactions Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>

                {/* Table Placeholder matching Ledger style */}
                <div className="space-y-0 border border-slate-100 rounded-xl overflow-hidden">
                    {/* Header Row */}
                    <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/6 ml-auto" />
                    </div>
                    {/* Data Rows */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 border-b border-slate-50 flex items-center gap-4 last:border-0">
                            <div className="flex-1 flex gap-4 items-center">
                                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                                <div className="space-y-1 w-full">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <div className="w-32 flex justify-end">
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
