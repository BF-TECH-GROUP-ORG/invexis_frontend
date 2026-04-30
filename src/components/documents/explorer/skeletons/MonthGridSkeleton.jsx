"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function MonthGridSkeleton() {
    return (
        <div className="p-12 max-w-[1700px] mx-auto min-h-screen">
            {/* Header Placeholder */}
            <div className="flex items-center gap-8 mb-16 px-4">
                <Skeleton className="w-16 h-16 rounded-3xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-full opacity-40" />
                    <Skeleton className="h-10 w-64 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-4xl shadow-sm flex flex-col items-center gap-6">
                        <Skeleton className="w-16 h-16 rounded-3xl" />
                        <div className="w-full space-y-3 flex flex-col items-center">
                            <Skeleton className="h-6 w-1/2 rounded-lg" />
                            <Skeleton className="h-2 w-1/3 rounded-full opacity-40" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
