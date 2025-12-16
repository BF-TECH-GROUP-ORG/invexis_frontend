"use client";

export default function MonthGrid({ year, availableMonths, onSelectMonth, onBack }) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{year} Folder</h2>
                    <p className="text-sm text-gray-500">Select a month to view documents</p>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {months.map((month, index) => {
                    const isAvailable = availableMonths.includes(index + 1); // 1-based index check
                    return (
                        <button
                            key={month}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && onSelectMonth(index + 1)}
                            className={`group flex flex-col items-center p-6 border rounded-xl transition-all ${isAvailable
                                ? "bg-white border-gray-300 hover:border-orange-500 hover:shadow-md cursor-pointer"
                                : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                                }`}
                        >
                            <span className={`text-lg font-semibold mb-2 ${isAvailable ? "text-gray-700 group-hover:text-orange-600" : "text-gray-400"}`}>
                                {month}
                            </span>
                            {isAvailable ? (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                    Files Available
                                </span>
                            ) : (
                                <span className="text-xs text-gray-300">Empty</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
