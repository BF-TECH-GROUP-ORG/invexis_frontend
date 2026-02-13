import Skeleton from "@/components/shared/Skeleton";

export default function InvoicesLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>

            {/* Grid of Invoice Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center gap-6">
                        {/* Icon/Color Box */}
                        <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />

                        <div className="flex-1 space-y-3">
                            {/* Title */}
                            <Skeleton className="h-5 w-40 rounded-lg" />

                            {/* Metadata Row */}
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-1 w-1 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded" />
                                <Skeleton className="h-1 w-1 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>

                            {/* Amount */}
                            <Skeleton className="h-7 w-32 rounded-lg mt-1" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
