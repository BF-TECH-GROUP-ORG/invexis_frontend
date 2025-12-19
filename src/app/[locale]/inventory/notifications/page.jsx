"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
    Package,
    CreditCard,
    Info,
    CheckCircle,
    Bell,
    CheckCheck,
    Filter,
    Trash2
} from "lucide-react";
import { getNotifications, markNotificationsRead } from "@/services/notificationService";

export default function NotificationsPage() {
    const { data: session } = useSession();
    const locale = useLocale();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    // Fetch Logic
    const fetchNotifs = async () => {
        try {
            setLoading(true);
            const typeFilter = activeTab === 'all' ? undefined :
                activeTab === 'sales' ? 'sales_alert' :
                    activeTab === 'inventory' ? 'inventory_alert' :
                        activeTab === 'system' ? 'system_update' : undefined;

            const res = await getNotifications({
                page,
                limit: LIMIT,
                type: typeFilter
                // We probably want ALL notifications here (read and unread) for a history view
                // unreadOnly: true // Removed to show history
            });

            if (res.success && res.data?.notifications) {
                setNotifications(res.data.notifications);
                setTotal(res.data.pagination?.total || 0);
            }
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifs();
        }
    }, [session?.user?.id, activeTab, page]);

    // Actions
    const handleMarkAllRead = async () => {
        try {
            await markNotificationsRead({ all: true });
            // Optimistically update local state? 
            // Or just refresh. Refresh shows them as read (if visual indicator exists)
            fetchNotifs();
        } catch (err) {
            console.error("Failed to mark all read", err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationsRead({ notificationIds: [id] });
            // Update local state to show as read
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, readBy: [...(n.readBy || []), session.user.id] } : n
            ));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const handleNotificationClick = (n) => {
        // Mark read if needed
        if (!n.readBy?.includes(session?.user?.id)) {
            handleMarkRead(n._id);
        }

        // Navigate
        const basePath = `/${locale}/inventory`;
        switch (n.type) {
            case 'inventory_alert':
                if (n.payload?.productId) {
                    router.push(`${basePath}/products/details/${n.payload.productId}`);
                } else {
                    router.push(`${basePath}/alerts`);
                }
                break;
            case 'sales_alert':
                router.push(`${basePath}/sales`);
                break;
            case 'payment_success':
                router.push(`${basePath}/billing`);
                break;
            default:
                break;
        }
    };

    // Helpers
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
            case 'urgent': return "bg-red-500";
            case 'medium': return "bg-orange-500";
            case 'low': return "bg-blue-500";
            default: return "bg-blue-400";
        }
    };

    const getIconByType = (type) => {
        switch (type) {
            case 'inventory_alert': return <Package className="w-5 h-5 text-amber-600" />;
            case 'sales_alert': return <CreditCard className="w-5 h-5 text-green-600" />;
            case 'payment_success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'system_update': return <Info className="w-5 h-5 text-blue-600" />;
            default: return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const isRead = (n) => n.readBy?.includes(session?.user?.id);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Stay updated with system alerts and activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 shadow-sm"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    {['all', 'sales', 'inventory', 'system'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                            className={`pb-4 text-sm font-medium capitalize transition-all relative ${activeTab === tab
                                    ? 'text-orange-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${isRead(n) ? 'bg-white border-gray-100' : 'bg-orange-50/30 border-orange-100'
                                }`}
                        >
                            {/* Priority Indicator */}
                            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getPriorityColor(n.priority)}`} />

                            {/* Icon */}
                            <div className={`p-3 rounded-lg flex-shrink-0 ${isRead(n) ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                {getIconByType(n.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`text-base font-semibold ${isRead(n) ? 'text-gray-700' : 'text-gray-900'}`}>
                                        {n.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                        {n.createdAt ? new Date(n.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${isRead(n) ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {n.body}
                                </p>

                                {/* Payload Hints (Optional) */}
                                {n.payload && Object.keys(n.payload).length > 0 && n.type === 'inventory_alert' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            Stock: {n.payload.currentStock}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions (Hover) */}
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isRead(n) && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                                        title="Mark as read"
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination (Simple) */}
            {total > LIMIT && (
                <div className="flex justify-center pt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border rounded-l-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 border-t border-b bg-gray-50 text-sm flex items-center">
                        Page {page}
                    </span>
                    <button
                        disabled={page * LIMIT >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border rounded-r-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
}
