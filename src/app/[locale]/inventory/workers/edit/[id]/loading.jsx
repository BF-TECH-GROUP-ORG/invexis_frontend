import Skeleton from "@/components/shared/Skeleton";

export default function EditWorkerLoading() {
    return (
        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="flex w-full items-stretch min-h-[600px]">
                {/* Left Side: Form Fields */}
                <div className="flex-1 p-6 md:p-10 flex flex-col bg-white dark:bg-gray-900">
                    {/* Header */}
                    <div className="mb-8 space-y-2">
                        <Skeleton className="h-10 w-60" />
                        <Skeleton className="h-5 w-80 rounded-md" />
                        <div className="flex items-center gap-2 pt-1">
                            <Skeleton className="h-4 w-20 rounded-md" />
                            <span className="text-gray-300 dark:text-gray-600">/</span>
                            <Skeleton className="h-4 w-20 rounded-md" />
                            <span className="text-gray-300 dark:text-gray-600">/</span>
                            <Skeleton className="h-4 w-20 rounded-md" />
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-grow space-y-5">
                        <Skeleton className="h-6 w-44 rounded-md" />
                        <div className="flex gap-4">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <Skeleton className="h-12 w-28" />
                        <Skeleton className="h-12 w-36" />
                    </div>
                </div>

                {/* Right Side: Stepper (desktop only) */}
                <div className="hidden lg:block w-[500px] border-l border-gray-100 dark:border-gray-800 p-10 bg-white dark:bg-gray-900">
                    <div className="space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton variant="circle" className="h-12 w-12 shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-5 w-32 rounded-md" />
                                    <Skeleton className="h-4 w-48 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
