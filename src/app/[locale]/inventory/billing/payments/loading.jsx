
import Skeleton from "@/components/shared/Skeleton";

export default function Loading() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-4 space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div>
                            <Skeleton className="h-8 w-32 mb-1" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

                {/* Filters Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-auto">
                        <Skeleton className="h-10 w-full md:w-80 rounded-lg" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                </div>

                {/* Table Header */}
                <div className="w-full border-b border-gray-100 pb-4 flex justify-between px-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Table Rows */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center px-4 py-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-3 w-24" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
