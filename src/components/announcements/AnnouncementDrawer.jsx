import React from 'react';
import { X, ExternalLink, Calendar, Link as LinkIcon, Download } from 'lucide-react';

const AnnouncementDrawer = ({ isOpen, onClose, announcement }) => {
    if (!isOpen || !announcement) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${announcement.type === 'sale' ? 'bg-green-100 text-green-700' :
                                    announcement.type === 'alert' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {announcement.type}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(announcement.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {announcement.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-sm max-w-none text-gray-600">
                        <p className="text-lg text-gray-800 font-medium mb-4">{announcement.context}</p>

                        {/* Mock Details */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Details</h4>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Entity ID:</span>
                                <span className="font-mono text-gray-700">{announcement.entityId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Category:</span>
                                <span className="capitalize text-gray-700">{announcement.category}</span>
                            </div>
                        </div>

                        <p className="mt-6">
                            This is a detailed view of the announcement. In a real application,
                            this would contain specific details pulled from the related module
                            (e.g., the full invoice line items, the specific stock adjustments, etc.).
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                        View Related Entity
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:text-gray-900">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:text-gray-900">
                            <LinkIcon className="w-4 h-4" /> Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDrawer;
