"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function MonthGridSkeleton() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header Placeholder */}
            <div className="flex items-center gap-8 mb-16 px-2">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-3 w-64" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm space-y-6">
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
