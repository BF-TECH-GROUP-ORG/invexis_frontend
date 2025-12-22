import Skeleton from "@/components/shared/Skeleton";
import { Package, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white p-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="border-2 border-gray-100 rounded-2xl p-5 bg-white"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="w-12 h-12 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-300 mb-6 p-1">
                <div className="flex">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 px-4 py-4 flex justify-center">
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96 w-full rounded-xl" />
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        </div>
    );
}
