"use client";

export default function RecentDocsList({ documents, onOpenValues }) {
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
                {documents.map((doc) => (
                    <div key={doc.id} className="group relative bg-white border border-gray-300 rounded-xl p-4 hover:shadow-md transition-all hover:border-orange-500">
                        {/* Icon & Label */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                {doc.type}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 truncate mb-1" title={doc.name}>{doc.name}</h3>
                            <p className="text-xs text-gray-500">{doc.date}</p>
                        </div>

                        {/* Action */}
                        <button
                            onClick={() => onOpenValues(doc)}
                            className="w-full py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View
                        </button>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="mt-8 border-b border-gray-100"></div>
        </div>
    );
}
