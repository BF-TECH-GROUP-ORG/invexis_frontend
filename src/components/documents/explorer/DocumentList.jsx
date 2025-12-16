"use client";

export default function DocumentList({ documents, year, month, onOpenValues, onBack }) {
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>{year}</span>
                            <span>/</span>
                            <span>{monthName}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Files ({documents.length})</h2>
                    </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                    Bulk Download
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => {
                    const isSelected = selectedIds?.includes(doc.id);
                    return (
                        <div
                            key={doc.id}
                            className={`flex items-center p-4 border rounded-xl transition-all ${isSelected
                                ? 'bg-orange-50/30 border-orange-500'
                                : 'bg-white border-gray-300 hover:shadow-sm'
                                }`}
                        >
                            {/* Custom Checkbox */}
                            <div
                                className="mr-4 cursor-pointer p-2 -m-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(doc.id);
                                }}
                            >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isSelected
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'bg-white border-gray-300 hover:border-orange-400'
                                    }`}>
                                    {isSelected && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${isSelected ? 'bg-orange-100 text-orange-600' : 'bg-red-50 text-red-500'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggleSelect(doc.id)}>
                                <h3 className={`font-semibold truncate ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>{doc.name}</h3>
                                <p className="text-xs text-gray-500">Generated {doc.date} • {doc.size}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onOpenValues(doc)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    Open
                                </button>
                                {/* Download button removed from here if redundant, but keeping as single action */}
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                                    Download
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
