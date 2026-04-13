"use client";
import Skeleton from "@/components/shared/Skeleton";

export default function YearGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 p-12 max-w-[1700px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col items-center p-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-sm">
                    {/* Icon Placeholder */}
                    <Skeleton className="w-24 h-24 mb-8 rounded-4xl" />
                    {/* Text Placeholders */}
                    <div className="w-full space-y-3 flex flex-col items-center">
                        <Skeleton className="h-6 w-1/3 rounded-lg" />
                        <Skeleton className="h-2 w-1/2 rounded-full opacity-40" />
                    </div>
                </div>
            ))}
        </div>
    );
}
