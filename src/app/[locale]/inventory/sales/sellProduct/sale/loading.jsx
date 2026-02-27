import Skeleton from "@/components/shared/Skeleton";

export default function SaleProductLoading() {
    return (
        <div className="space-y-6">

            {/* Back Button */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-10" />
            </div>

            {/* === 4 Stats Cards === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border-2 border-gray-100 rounded-2xl p-5 bg-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <Skeleton className="h-3 w-28 mb-3" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        </div>
                    </div>
                ))}
            </div>

            {/* === Title + Subtitle === */}
            <div>
                <Skeleton className="h-9 w-56 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* === Main Table Card === */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Inner Title + Search + Filter */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <Skeleton className="h-6 w-44 mb-1.5" />
                            <Skeleton className="h-3 w-64" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-48 rounded-xl" />
                            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Action Toolbar: 0 Selected | Debt Sale toggle | Transfer + Complete buttons */}
                <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-10 rounded-full" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-9 w-32 rounded-lg" />
                        <Skeleton className="h-9 w-36 rounded-lg" />
                        <Skeleton className="h-9 w-36 rounded-lg" />
                    </div>
                </div>

                {/* Table Header: No | Select | Product | SKU | Category | Stock | Min Price | Selling Price | Quantity | Actions */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="grid grid-cols-10 gap-3 items-center">
                        <Skeleton className="h-3 w-6" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-16 col-span-2" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="px-6 py-3">
                            <div className="grid grid-cols-10 gap-3 items-center">
                                {/* No */}
                                <Skeleton className="h-4 w-6" />
                                {/* Checkbox */}
                                <Skeleton className="h-5 w-5 rounded" />
                                {/* Product (avatar + name) */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                {/* SKU */}
                                <Skeleton className="h-4 w-28" />
                                {/* Category */}
                                <Skeleton className="h-6 w-16 rounded-full" />
                                {/* Stock */}
                                <Skeleton className="h-6 w-8 rounded-md" />
                                {/* Min Price */}
                                <Skeleton className="h-4 w-10" />
                                {/* Selling Price */}
                                <Skeleton className="h-4 w-8" />
                                {/* Qty + Set Price */}
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-8 w-20 rounded" />
                                    <Skeleton className="h-8 w-16 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
