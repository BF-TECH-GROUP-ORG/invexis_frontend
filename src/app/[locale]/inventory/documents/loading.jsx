
import React from 'react';
import Skeleton from "@/components/shared/Skeleton";
import YearGridSkeleton from '@/components/documents/explorer/skeletons/YearGridSkeleton';
import { Search, Menu } from 'lucide-react';

export default function DocumentsLoading() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area Skeleton */}
                <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                    {/* Top Bar Skeleton */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <div className="md:hidden p-2">
                                <Menu size={18} className="text-gray-300" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <Search size={16} className="text-gray-300" />
                            </div>
                            <Skeleton className="h-10 w-72 rounded-full" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <YearGridSkeleton />
                    </div>
                </div>

                {/* Right Pane: Folder Navigation Skeleton (desktop) */}
                <div className="hidden md:block border-l border-gray-200 bg-white flex-shrink-0 w-80 p-6 space-y-8">
                    <Skeleton className="h-6 w-32 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
