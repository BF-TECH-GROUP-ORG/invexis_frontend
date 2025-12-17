"use client";
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { downloadDocument, archiveDocument, trashDocument, deleteDocument } from '@/features/documents/documentsSlice';

export default function PreviewPanel({ document, onClose }) {
    const dispatch = useDispatch();
    // Role Toggle State (Simulated)
    const [role, setRole] = useState("Company"); // 'Company' | 'Super Admin'

    if (!document) return null;

    const handleDownload = () => {
        dispatch(downloadDocument({ id: document.id, name: document.name }));
    };

    const handleArchive = () => {
        dispatch(archiveDocument(document.id));
        onClose();
    };

    const handleTrash = () => {
        dispatch(trashDocument(document.id));
        onClose();
    };

    return (
        <div className="flex h-screen border-l border-gray-200 bg-gray-50 max-w-5xl w-full shadow-2xl relative z-50">
            {/* Left Column: Metadata & Activity */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 truncate">Document Details</h3>
                    <div className="flex items-center gap-2">
                        {/* Archive Button */}
                        <button onClick={handleArchive} title="Archive" className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        </button>
                        {/* Trash Button */}
                        <button onClick={handleTrash} title="Move to Trash" className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Role Toggle */}
                    <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-semibold mb-4">
                        <button
                            onClick={() => setRole("Company")}
                            className={`flex-1 py-1.5 rounded-md transition-all ${role === "Company" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Company View
                        </button>
                        <button
                            onClick={() => setRole("Super Admin")}
                            className={`flex-1 py-1.5 rounded-md transition-all ${role === "Super Admin" ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Super Admin
                        </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4">
                        <div className="flex justify-between"><span className="text-gray-500 text-sm">ID</span><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{document.id}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 text-sm">Date</span><span className="text-sm font-medium">{document.date}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 text-sm">Type</span><span className="text-sm font-medium">{document.type}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 text-sm">Amount</span><span className="text-sm font-medium">${document.amount?.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 text-sm">Status</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${document.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-800'}`}>
                                {document.status}
                            </span>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Activity Timeline</h4>
                        <div className="space-y-4 relative border-l-2 border-gray-100 ml-2">
                            {document.activity && document.activity.map((act, index) => {
                                // Filter internal logs for Company role
                                if (role === 'Company' && act.isInternal) return null;

                                return (
                                    <div key={index} className="ml-4 relative">
                                        <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-xs text-gray-500 mb-0.5">{act.date}</p>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900 leading-snug">{act.action}</span>
                                            {act.isInternal && <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 self-start px-1 rounded mt-0.5">Internal Log</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">by {act.user}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <button
                        onClick={handleDownload}
                        className="w-full py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 shadow-sm flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Right Column: PDF Viewer */}
            <div className="flex-1 bg-gray-100 p-8 flex justify-center overflow-y-auto">
                {/* The "Paper" */}
                <div className="bg-white shadow-xl w-full max-w-[21cm] min-h-[29.7cm] p-12 relative flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            {document.images?.[0] ? (
                                <img src={document.images[0].url} alt="Logo" className="h-12 mb-2 object-contain" />
                            ) : (
                                <h1 className="text-3xl font-bold text-gray-900">INVEXIS</h1>
                            )}
                            <p className="text-gray-500 text-sm">123 Business Rd, Tech City</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-light text-gray-400 uppercase tracking-widest">{document.type}</h2>
                            <p className="font-mono text-lg text-gray-900 mt-1">#{document.id.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 space-y-8">
                        {/* Bill To / From */}
                        <div className="flex justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Bill To</p>
                                <p className="font-bold text-gray-900">Customer Name</p>
                                <p className="text-gray-600 text-sm">456 Customer Ln</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Details</p>
                                <p className="text-sm"><span className="text-gray-500">Issued:</span> {document.date}</p>
                                <p className="text-sm"><span className="text-gray-500">Due:</span> {document.date}</p>
                            </div>
                        </div>

                        {/* Table Mockup */}
                        <table className="w-full text-sm mt-8">
                            <thead className="border-b-2 border-gray-100">
                                <tr className="text-left text-gray-500">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Qty</th>
                                    <th className="py-2 text-right">Price</th>
                                    <th className="py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="py-3 font-medium text-gray-900">Service / Product A</td>
                                    <td className="py-3 text-right">1</td>
                                    <td className="py-3 text-right">$500.00</td>
                                    <td className="py-3 text-right">$500.00</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium text-gray-900">Service / Product B</td>
                                    <td className="py-3 text-right">2</td>
                                    <td className="py-3 text-right">$250.00</td>
                                    <td className="py-3 text-right">$500.00</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end mt-4">
                            <div className="w-48 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>$1,000.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax (10%)</span>
                                    <span>$100.00</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>$1,100.00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signature */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end">
                        <div className="text-xs text-gray-400">
                            <p>Generated by Invexis System</p>
                            <p>{document.id} • {document.lastModified}</p>
                        </div>
                        {document.images?.[1] && (
                            <div>
                                <img src={document.images[1].url} alt="Signature" className="h-10 opacity-70" />
                                <p className="text-xs text-gray-400 mt-1 border-t w-32 pt-1">Authorized Signature</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
