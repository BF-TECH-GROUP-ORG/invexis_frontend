import Skeleton from "@/components/shared/Skeleton";

export default function SalesHistoryLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 overflow-x-auto">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-40 shrink-0" />
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="p-4 space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-6 w-1/6" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/6" />
                            <Skeleton className="h-6 w-1/6" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
