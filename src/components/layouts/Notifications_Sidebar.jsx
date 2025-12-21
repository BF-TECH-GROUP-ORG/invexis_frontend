"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { X, Bell, ExternalLink, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  selectAllNotifications,
  selectUnreadCount,
  fetchNotificationsThunk,
  markAsReadThunk
} from "@/features/NotificationSlice";
import { INTENT_CONFIG, NOTIFICATION_INTENTS } from "@/constants/notifications";

export default function NotificationSideBar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const locale = useLocale();
  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  // Fetch notifications when sidebar opens
  useEffect(() => {
    if (isOpen) {
      // Only fetch if we have a valid session
      if (dispatch) {
        dispatch(fetchNotificationsThunk({ unreadOnly: true, limit: 10 }))
          .catch(err => {
            console.log('[Notifications] Failed to fetch, will retry when needed');
          });
      }
    }
  }, [isOpen, dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAsReadThunk({ all: true }));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.readBy || notification.readBy.length === 0) {
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
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-80 md:w-96 h-full bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-orange-50 to-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Inbox</h2>
                  {unreadCount > 0 && (
                    <span className="text-xs text-orange-600 font-semibold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const config = getIntentConfig(n.intent);
                  const IconComponent = config.icon;
                  const isUnread = !n.readBy || n.readBy.length === 0;

                  return (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`relative flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${isUnread
                        ? `${config.bgColor} ${config.borderColor} shadow-sm`
                        : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      {/* Intent Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${config.textColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${config.textColor}`}>
                                {config.label}
                              </span>
                              {n.priority === 'urgent' && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <h4 className={`font-bold text-sm mb-1 ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                              {n.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase whitespace-nowrap">
                              {getTimeAgo(n.createdAt)}
                            </span>
                            {isUnread && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(markAsReadThunk({ notificationIds: [n._id] }));
                                }}
                                className="p-1 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Mark as read"
                              >
                                <CheckCheck className="w-3.5 h-3.5 text-gray-500 hover:text-orange-600" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                        {n.actionUrl && (
                          <div className="mt-2 flex items-center gap-1 text-orange-600 text-xs font-semibold group-hover:gap-2 transition-all">
                            <span>Take Action</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Unread Indicator */}
                      {isUnread && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    All caught up!
                  </h3>
                  <p className="text-sm text-gray-500">
                    No new notifications at the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50/50 space-y-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="w-full py-2.5 text-sm font-bold text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-all"
                >
                  Mark all as read
                </button>
              )}
              <Link
                href={`/${locale}/inventory/notifications`}
                onClick={onClose}
                className="block w-full py-2.5 text-center text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                View Full Inbox
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
