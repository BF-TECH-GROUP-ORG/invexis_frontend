"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function YearGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 p-8 max-w-[1600px] mx-auto">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm">
                    {/* Icon Placeholder */}
                    <Skeleton className="w-24 h-24 mb-6 rounded-3xl" />
                    {/* Text Placeholders */}
                    <div className="w-full space-y-3 flex flex-col items-center">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}
