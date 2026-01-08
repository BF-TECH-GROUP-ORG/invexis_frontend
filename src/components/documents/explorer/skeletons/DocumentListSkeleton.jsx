"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function DocumentListSkeleton() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-4">
            {/* Header Placeholder */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
                <div className="flex items-center gap-8">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <Skeleton className="w-24 h-10 rounded-xl" />
                    <Skeleton className="w-32 h-10 rounded-2xl" />
                </div>
            </div>

            {/* List Row Placeholders */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center p-6 bg-white border border-slate-50 rounded-[2rem] shadow-sm gap-6">
                    <Skeleton className="w-7 h-7 rounded-xl" />
                    <Skeleton className="w-16 h-16 rounded-3xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="flex gap-4">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
