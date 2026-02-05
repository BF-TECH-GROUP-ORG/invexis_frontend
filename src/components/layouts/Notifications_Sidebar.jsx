"use client";

import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { X, Bell, ExternalLink, CheckCheck, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    selectAllNotifications,
    selectUnreadCount,
    markAsReadThunk
} from "@/features/NotificationSlice";
import { INTENT_CONFIG, NOTIFICATION_INTENTS } from "@/constants/notifications";

export default function NotificationSideBar({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const locale = useLocale();
    const { data: session } = useSession();
    const currentUserId = session?.user?._id;

    const allNotifications = useSelector(selectAllNotifications);
    const unreadCount = useSelector(selectUnreadCount);

    // Filter for unread notifications only (client-side)
    const unreadNotifications = useMemo(() => {
        return allNotifications
            .filter(n => currentUserId && (!n.readBy || !n.readBy.includes(currentUserId)))
            .slice(0, 10); // Show only latest 10 in sidebar
    }, [allNotifications, currentUserId]);

    const handleMarkAsRead = (notificationId, e) => {
        e.stopPropagation();
        dispatch(markAsReadThunk({ notificationIds: [notificationId] }));
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (currentUserId && (!notification.readBy || !notification.readBy.includes(currentUserId))) {
            dispatch(markAsReadThunk({ notificationIds: [notification._id] }));
        }

        // Navigate if actionUrl exists
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
            onClose();
        }
    };

    const getIntentConfig = (intent) => {
        return INTENT_CONFIG[intent] || INTENT_CONFIG[NOTIFICATION_INTENTS.OPERATIONAL];
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Now';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 w-80 md:w-96 h-full bg-gradient-to-b from-gray-50 to-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-xl">
                                        <Bell className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">Inbox</h2>
                                        {unreadCount > 0 && (
                                            <p className="text-xs text-orange-600 font-bold">
                                                {unreadCount} unread
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {unreadNotifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center h-64"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Bell className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">All caught up!</p>
                                        <p className="text-xs text-gray-400">No new notifications</p>
                                    </motion.div>
                                ) : (
                                    unreadNotifications.map((n, index) => {
                                        const notificationIntent = n.payload?.intent || n.intent || 'operational';
                                        const config = getIntentConfig(notificationIntent);
                                        const IconComponent = config.icon;

                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                                key={n._id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`relative p-4 rounded-2xl border-2 ${config.borderColor} bg-white hover:shadow-lg transition-all cursor-pointer group`}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Intent Icon */}
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                                                        <IconComponent className={`w-5 h-5 ${config.textColor}`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
                                                                {config.label}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {getTimeAgo(n.createdAt)}
                                                            </span>
                                                        </div>

                                                        <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                                                            {n.title}
                                                        </h3>

                                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                                            {n.body}
                                                        </p>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(n._id, e)}
                                                                className="text-[10px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                                                            >
                                                                <CheckCheck className="w-3 h-3" />
                                                                Mark read
                                                            </button>
                                                            {n.actionUrl && (
                                                                <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    View
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-white/80 backdrop-blur-md">
                            <Link
                                href={`/${locale}/inventory/notifications`}
                                onClick={onClose}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-bold text-sm shadow-lg"
                            >
                                View All Notifications
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
