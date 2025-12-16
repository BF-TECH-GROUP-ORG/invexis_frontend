"use client";

export default function YearGrid({ years, onSelectYear }) {
    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Select Year</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                {years.map((year) => (
                    <button
                        key={year}
                        onClick={() => onSelectYear(year)}
                        className="group flex flex-col items-center p-4 bg-white border border-gray-300 rounded-xl hover:border-orange-500 hover:shadow-md transition-all"
                    >
                        <div className="w-16 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500 transition-colors">
                            {/* Folder Icon */}
                            <svg className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-orange-600">{year}</span>
                        <span className="text-xs text-gray-400 mt-1">Open Folder</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
