"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function DocumentListSkeleton() {
    return (
        <div className="p-12 max-w-[1700px] mx-auto space-y-4">
            {/* Header Placeholder */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                <div className="flex items-center gap-8">
                    <Skeleton className="w-16 h-16 rounded-3xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-32 rounded-full opacity-40" />
                        <Skeleton className="h-10 w-56 rounded-xl" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="w-28 h-12 rounded-2xl" />
                </div>
            </div>

            {/* List Row Placeholders */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center p-6 bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl shadow-sm gap-8">
                    <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    <Skeleton className="w-16 h-16 rounded-3xl shrink-0" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-1/3 rounded-lg" />
                        <div className="flex gap-4">
                            <Skeleton className="h-2 w-24 rounded-full opacity-40" />
                            <Skeleton className="h-2 w-16 rounded-full opacity-20" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="w-32 h-12 rounded-2xl" />
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}
