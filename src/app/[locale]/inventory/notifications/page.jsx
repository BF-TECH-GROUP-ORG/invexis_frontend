"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  Bell,
  RefreshCw,
  CheckCheck,
  ExternalLink,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Trash2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  selectAllNotifications,
  selectUnreadCount,
  selectNotificationLoading,
  selectNotificationFilter,
  fetchNotificationsThunk,
  markAsReadThunk,
  setFilter
} from "@/features/NotificationSlice";
import { INTENT_CONFIG, NOTIFICATION_INTENTS, PRIORITY_LEVELS } from "@/constants/notifications";

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const locale = useLocale();

  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);
  const pagination = useSelector(state => state.notifications.pagination);

  const [readFilter, setReadFilter] = useState('all'); // all, unread, read
  const [intentFilter, setIntentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority

  const { data: session } = useSession();
  const currentUserId = session?.user?._id;

  useEffect(() => {
    if (dispatch && currentUserId) {
      // Fetch ALL notifications once - we'll filter client-side
      dispatch(fetchNotificationsThunk({ limit: 50, page: 1, userId: currentUserId }));
    }
  }, [dispatch, currentUserId]);

  const handleRefresh = () => {
    if (currentUserId) {
      dispatch(fetchNotificationsThunk({ limit: 50, page: 1, userId: currentUserId }));
    }
  };


  const handleMarkAllRead = () => {
    dispatch(markAsReadThunk({ all: true })).then(() => {
      handleRefresh();
    });
  };

  const handleMarkRead = (id) => {
    dispatch(markAsReadThunk({ notificationIds: [id] }));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.readBy || notification.readBy.length === 0) {
      handleMarkRead(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
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

  const filteredAndSortedNotifications = useMemo(() => {
    let result = notifications.filter(n => {
      // If currentUserId is not available yet, treat all as unread
      const isReadByMe = currentUserId ? (n.readBy && n.readBy.includes(currentUserId)) : false;

      // Read status filter
      if (readFilter === 'unread' && isReadByMe) return false;
      if (readFilter === 'read' && !isReadByMe) return false;

      // Intent filter - check payload.intent field
      const notificationIntent = n.payload?.intent || n.intent;
      if (intentFilter !== 'all' && notificationIntent !== intentFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query);
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priority') {
        const priorityScore = { urgent: 3, high: 2, normal: 1, low: 0 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      return 0;
    });

    return result;
  }, [notifications, readFilter, intentFilter, searchQuery, sortBy, currentUserId]);

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-white">

      {/* Left Sidebar - Filters */}
      <aside className="w-72 border-r bg-gray-50/50 p-6 space-y-8 overflow-y-auto backdrop-blur-sm">
        <div className="relative">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Search Inbox</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Filter className="w-3 h-3" />
            Read Status
          </h3>
          <div className="space-y-1.5">
            {['all', 'unread', 'read'].map(status => (
              <button
                key={status}
                onClick={() => setReadFilter(status)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between group ${readFilter === status
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-gray-600 hover:bg-white hover:shadow-md'
                  }`}
              >
                <span className="capitalize">{status}</span>
                {status === 'unread' && unreadCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${readFilter === status ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Intents</h3>
          <div className="space-y-1.5">
            <button
              onClick={() => setIntentFilter('all')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${intentFilter === 'all'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-gray-600 hover:bg-white hover:shadow-md'
                }`}
            >
              <Bell className="w-4 h-4" />
              All Notifications
            </button>
            {Object.entries(INTENT_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              const isActive = intentFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setIntentFilter(key)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${isActive
                    ? `${config.bgColor} ${config.textColor} border-2 ${config.borderColor} shadow-md`
                    : 'text-gray-600 hover:bg-white hover:shadow-md'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : config.bgColor}`}>
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : config.textColor}`} />
                  </div>
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">

        {/* Header */}
        <header className="px-8 py-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notification Inbox</h1>
                <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live Sync
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                Showing {filteredAndSortedNotifications.length} items
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('priority')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === 'priority' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Priority
                </button>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl border border-gray-200 bg-white transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 text-sm font-black"
                >
                  <CheckCheck className="w-4 h-4" />
                  Clear Unread
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {loading && filteredAndSortedNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-80"
              >
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6" />
                <p className="text-gray-500 font-medium animate-pulse">Syncing notifications...</p>
              </motion.div>
            ) : filteredAndSortedNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-96 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-gray-200"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Bell className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Clean Slate!</h3>
                <p className="text-gray-500 text-sm max-w-xs text-center">
                  {readFilter === 'unread' ? "You've successfully addressed all urgent matters." : "No notifications found matching your search criteria."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-6 text-orange-500 font-bold text-sm hover:underline"
                  >
                    Clear Search Query
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4 max-w-5xl mx-auto">
                {filteredAndSortedNotifications.map((n, index) => {
                  const notificationIntent = n.payload?.intent || n.intent || 'operational';
                  const config = getIntentConfig(notificationIntent);
                  const IconComponent = config.icon;
                  const isReadByMe = n.readBy && n.readBy.includes(currentUserId);
                  const isUnread = !isReadByMe;
                  const isUrgent = n.priority === PRIORITY_LEVELS.URGENT;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`relative flex gap-6 p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${isUnread
                        ? `bg-white ${config.borderColor} shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:scale-[1.01]`
                        : 'bg-white/40 border-gray-100 opacity-80 hover:opacity-100 hover:border-gray-200'
                        }`}
                    >
                      {/* Intent Icon */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${config.bgColor} ${isUrgent ? 'animate-pulse' : ''}`}>
                        <IconComponent className={`w-8 h-8 ${config.textColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${config.bgColor} ${config.textColor}`}>
                                {config.label}
                              </span>
                              {isUrgent && (
                                <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded uppercase tracking-tighter">
                                  Urgent Action
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(n.createdAt)}
                              </span>
                            </div>
                            <h3 className={`font-black text-xl mb-2 tracking-tight ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                              {n.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                              {n.body}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-4">
                            {isUnread && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkRead(n._id);
                                }}
                                className="p-3 bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white rounded-2xl transition-all shadow-sm group/btn"
                                title="Mark as read"
                              >
                                <CheckCheck className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                              </button>
                            )}
                            {n.actionUrl && (
                              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                <ExternalLink className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>

                        {n.actionUrl && (
                          <div className="mt-4 flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                            <span>Open Attachment</span>
                            <div className="h-px flex-1 bg-orange-100" />
                            <ArrowUpDown className="w-3 h-3 rotate-90" />
                          </div>
                        )}
                      </div>

                      {/* Line Indicator */}
                      {isUnread && (
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-[2rem] ${config.bgColor === 'bg-orange-50' ? 'bg-orange-500' :
                          config.bgColor === 'bg-blue-50' ? 'bg-blue-500' :
                            config.bgColor === 'bg-red-50' ? 'bg-red-500' :
                              config.bgColor === 'bg-green-50' ? 'bg-green-500' :
                                config.bgColor === 'bg-purple-50' ? 'bg-purple-500' : 'bg-gray-500'}`} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Pagination */}
        {pagination.pages > 1 && (
          <footer className="px-8 py-4 border-t bg-white flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${pagination.page === i + 1 ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}
