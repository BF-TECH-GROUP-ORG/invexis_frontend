"use client";
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addDocument } from '@/features/documents/documentsSlice';

// Random generator helper
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateDate = () => new Date().toISOString().split('T')[0];

export default function EventSimulator() {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);

    const simulateEvent = (event) => {
        let newDoc = {
            id: generateId(),
            date: generateDate(),
            uploadedBy: "System",
            version: "v1.0",
            attachments: 1,
            size: "128 KB",
            lastModified: generateDate(),
            tags: [],
            images: [], // For PDF visuals
        };

        switch (event) {
            case 'SALE':
                newDoc = {
                    ...newDoc,
                    name: `Invoice #${Math.floor(Math.random() * 10000)}`,
                    type: "Invoice",
                    status: "Financial",
                    amount: Math.floor(Math.random() * 5000) + 100,
                    category: "Finance",
                    tags: ["sale", "invoice"],
                    priority: "high",
                    images: [
                        { label: "Company Logo", url: "https://via.placeholder.com/150x50?text=Acme+Corp" },
                        { label: "Signature", url: "https://via.placeholder.com/200x50?text=Signed" }
                    ],
                    activity: [
                        { date: generateDate(), action: "Payment processed via Stripe (ID: ch_12345)", user: "System", isInternal: true },
                        { date: generateDate(), action: "Invoice generated and emailed to customer", user: "System", isInternal: false },
                        { date: generateDate(), action: "Order #2039 placed by Customer", user: "Customer Portal", isInternal: false }
                    ]
                };
                break;
            case 'INVENTORY':
                newDoc = {
                    ...newDoc,
                    name: `Inbound Manifest #${Math.floor(Math.random() * 1000)}`,
                    type: "Report",
                    status: "Approved",
                    amount: 0,
                    category: "Procurement",
                    tags: ["inventory", "inbound"],
                    priority: "medium",
                    images: [
                        { label: "Barcode", url: "https://via.placeholder.com/300x50?text=|||||||||||||" }
                    ],
                    activity: [
                        { date: generateDate(), action: "API Webhook received from WMS", user: "System", isInternal: true },
                        { date: generateDate(), action: "Stock levels updated in Warehouse A", user: "WMS Bot", isInternal: false },
                        { date: generateDate(), action: "Goods received and verified", user: "Warehouse Manager", isInternal: false },
                    ]
                };
                break;
            case 'AGREEMENT':
                newDoc = {
                    ...newDoc,
                    name: `Customer Agreement - New User`,
                    type: "Agreement",
                    status: "Approved",
                    amount: 0,
                    category: "Sales",
                    tags: ["legal", "contract"],
                    priority: "low",
                    images: [
                        { label: "User Initials", url: "https://via.placeholder.com/50x50?text=JD" }
                    ],
                    activity: [
                        { date: generateDate(), action: "User session authenticated (Auth0)", user: "System", isInternal: true },
                        { date: generateDate(), action: "User account permissions granted", user: "Admin System", isInternal: true },
                        { date: generateDate(), action: "Signed copy stored in secure vault", user: "Security audit", isInternal: false },
                        { date: generateDate(), action: "Terms & Conditions accepted by User IP 192.168.1.1", user: "Web Client", isInternal: false }
                    ]
                };
                break;
            default: return;
        }

        dispatch(addDocument(newDoc));
        setLastEvent(`Generated: ${newDoc.name}`);
        setTimeout(() => setLastEvent(null), 3000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100"
            >
                ⚡ Simulate Event
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-50">
                    <p className="text-xs text-gray-400 mb-2 px-2 uppercase tracking-wide font-bold">Trigger System Event</p>
                    <div className="space-y-1">
                        <button onClick={() => simulateEvent('SALE')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                            💰 New Sale (Invoice)
                        </button>
                        <button onClick={() => simulateEvent('INVENTORY')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                            📦 Inventory Received
                        </button>
                        <button onClick={() => simulateEvent('AGREEMENT')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                            🤝 Terms Accepted
                        </button>
                    </div>
                </div>
            )}

            {lastEvent && (
                <div className="absolute right-36 top-0 w-48 bg-gray-900 text-white text-xs py-1.5 px-3 rounded shadow-lg animate-fade-in-down pointer-events-none">
                    {lastEvent}
                </div>
            )}
        </div>
    );
}
