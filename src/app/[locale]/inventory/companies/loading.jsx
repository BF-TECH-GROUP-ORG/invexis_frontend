import Skeleton from "@/components/shared/Skeleton";

export default function CompaniesLoading() {
    return (
        <div className="mx-auto space-y-8 md:space-y-12">

            {/* === Header Section === */}
            <div className="space-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-2" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-2" />
                    <Skeleton className="h-4 w-14" />
                </div>

                {/* Title + Add Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-12 w-44 rounded-2xl" />
                </div>
            </div>

            {/* === Stats Cards === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* === Table Section === */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Toolbar: Title + Search + Export */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
                    <Skeleton className="h-7 w-36" />
                    <div className="flex items-center gap-3 flex-1 md:flex-none md:min-w-[340px]">
                        <Skeleton className="h-10 flex-1 rounded-2xl" />
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    </div>
                </div>

                {/* Table Head */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="grid grid-cols-6 gap-4 items-center">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-14 mx-auto" />
                    </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-50">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="px-6 py-4">
                            <div className="grid grid-cols-6 gap-4 items-center">
                                {/* Branch Info (avatar + name) */}
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                {/* City */}
                                <Skeleton className="h-4 w-20" />
                                {/* Address */}
                                <Skeleton className="h-4 w-28" />
                                {/* Capacity */}
                                <Skeleton className="h-6 w-10 rounded-md" />
                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-2 w-2 rounded-full" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                {/* Actions */}
                                <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
