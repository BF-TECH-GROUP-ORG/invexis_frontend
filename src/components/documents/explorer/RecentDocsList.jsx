"use client";

// Helper for badge colors
const getDocumentTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
        case 'invoice': return 'bg-blue-50 text-blue-600';
        case 'agreement': return 'bg-green-50 text-green-600';
        case 'financial': return 'bg-purple-50 text-purple-600';
        case 'report': return 'bg-orange-50 text-orange-600';
        default: return 'bg-gray-100 text-gray-500';
    }
};

export default function RecentDocsList({ documents, onOpenValues, selectedIds, onToggleSelect }) {
    if (!documents || documents.length === 0) return null;

    return (
        <div className="p-8 pb-0">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                    <p className="text-sm text-gray-500">Your most recent documents</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {documents.map((doc) => {
                    const isSelected = selectedIds?.includes(doc.id);
                    return (
                        <div
                            key={doc.id}
                            onDoubleClick={() => onOpenValues(doc)}
                            onClick={(e) => {
                                // Optional: Allow clicking card background to toggle select if single selection behavior preferred,
                                // but standard is double-click to open. We can keep it simple: Click checkbox for select.
                            }}
                            className={`group relative w-full h-80 bg-white border rounded-3xl flex flex-col items-start justify-between p-6 transition-all duration-200 cursor-pointer select-none ${isSelected
                                ? 'border-orange-500 bg-orange-50/30'
                                : 'border-gray-200 hover:border-orange-300'
                                }`}
                        >
                            {/* Custom Checkbox */}
                            <div
                                className="absolute top-4 right-4 z-10 p-2 -m-2" // Increase hit area without increasing visual size
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(doc.id);
                                }}
                            >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isSelected
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'bg-white border-gray-300 group-hover:border-orange-400'
                                    }`}>
                                    {isSelected && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Big PDF Icon */}
                            <div className="flex-1 w-full flex flex-col items-center justify-center pointer-events-none">
                                <div className="relative">
                                    <svg className={`w-24 h-24 drop-shadow-xl transition-colors ${isSelected ? 'text-orange-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className={`absolute -bottom-2 right-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${isSelected ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-600 border-red-200'}`}>PDF</span>
                                </div>
                            </div>

                            {/* Document Info */}
                            <div className="w-full text-left mt-4 space-y-2 pointer-events-none">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                    {doc.name || `Document #${doc.id}`}
                                </h3>

                                <div className="flex items-center justify-start gap-2 text-xs text-gray-400 font-medium">
                                    <span>{new Date(doc.date).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className={`uppercase font-bold ${doc.type === 'Invoice' ? 'text-blue-500' :
                                        doc.type === 'Report' ? 'text-orange-500' : 'text-gray-500'
                                        }`}>
                                        {doc.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Divider */}
            <div className="mt-8 border-b border-gray-100"></div>
        </div>
    );
}
