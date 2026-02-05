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
    Clock,
    Menu,
    X
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

export default function NotificationsClient() {
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            dispatch(fetchNotificationsThunk({ limit: pagination.limit || 20, page: 1, userId: currentUserId }));
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages || !currentUserId) return;
        dispatch(fetchNotificationsThunk({
            limit: pagination.limit || 20,
            page: newPage,
            userId: currentUserId
        }));

        // Smooth scroll to top of list
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const SidebarContent = () => (
        <>
            <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Search Inbox</label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    Status
                </h3>
                <div className="space-y-2">
                    {['all', 'unread', 'read'].map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setReadFilter(status);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between group ${readFilter === status
                                ? "bg-gray-100 font-bold border-l-5 border-orange-500 text-orange-500"
                                : 'text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50'
                                }`}
                        >
                            <span className="capitalize">{status}</span>
                            {status === 'unread' && unreadCount > 0 && (
                                <span className={`px-2.5  rounded-lg text-[10px] font-black ${readFilter === status ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'}`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Categories</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => {
                            setIntentFilter('all');
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${intentFilter === 'all'
                            ? "bg-gray-100 font-bold border-l-5 border-orange-500 text-orange-500"
                            : 'text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50'
                            }`}
                    >
                        <div className={`p-1.5 rounded-lg ${intentFilter === 'all' ? 'bg-white/20' : 'bg-orange-100'}`}>
                            <Bell className={`w-4 h-4 ${intentFilter === 'all' ? 'text-white' : 'text-orange-500'}`} />
                        </div>
                        All Alerts
                    </button>
                    {Object.entries(INTENT_CONFIG).map(([key, config]) => {
                        const IconComponent = config.icon;
                        const isActive = intentFilter === key;
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setIntentFilter(key);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 ${isActive
                                    ? `${config.bgColor} ${config.textColor} border-2 ${config.borderColor} shadow-sm`
                                    : 'text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : config.bgColor}`}>
                                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : config.textColor}`} />
                                </div>
                                {config.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-[calc(100vh-5rem)] bg-white relative overflow-hidden">
            {/* Mobile Drawer Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-20 bottom-0 left-0 w-80 bg-gray-50 z-50 p-6 space-y-8 overflow-y-auto lg:hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900">Filters</h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Left Sidebar */}
            <aside className="hidden lg:block w-80 border-r bg-gray-50/50 p-6 space-y-8 overflow-y-auto backdrop-blur-sm">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
                {/* Header */}
                <header className="px-5 lg:px-8 py-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center justify-between gap-4 max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
                        <div className="flex-1 flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight truncate">Inbox</h1>
                                    <div className="hidden sm:flex px-2 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-md items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Live
                                    </div>
                                </div>
                                <p className="text-[11px] lg:text-sm text-gray-500 flex items-center gap-2 truncate font-medium">
                                    {filteredAndSortedNotifications.length} items
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="hidden sm:flex items-center bg-gray-50 p-1.5 rounded-2xl border-2 border-gray-100">
                                <button
                                    onClick={() => setSortBy('newest')}
                                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${sortBy === 'newest' ? 'bg-white text-orange-500 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    New
                                </button>
                                <button
                                    onClick={() => setSortBy('priority')}
                                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${sortBy === 'priority' ? 'bg-white text-orange-500 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Hot
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
                                    className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 text-sm font-black group/clear"
                                >
                                    <CheckCheck className="w-5 h-5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Clear Unread</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 custom-scrollbar pb-32">
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
                                className="flex flex-col items-center justify-center h-[50vh] bg-white/50 rounded-[3rem] border-2 border-dashed border-gray-100"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <Bell className="w-12 h-12 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Clean Slate!</h3>
                                <p className="text-gray-400 text-sm max-w-xs text-center font-medium">
                                    {readFilter === 'unread' ? "You've successfully addressed all urgent matters." : "No notifications found matching your search criteria."}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Reset Search
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="grid gap-4 max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
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
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                            key={n._id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`group relative flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12 p-6 md:px-8 lg:px-10 lg:py-8 rounded-[2.5rem] border-2 transition-all cursor-pointer overflow-hidden ${isUnread
                                                ? `bg-white ${config.borderColor} shadow-sm hover:shadow-lg hover:-translate-y-1`
                                                : 'bg-white/40 border-transparent opacity-80 hover:opacity-100 hover:bg-white hover:border-gray-100 hover:shadow-md'
                                                }`}
                                        >
                                            {/* Left Accent Strip */}
                                            {isUnread && (
                                                <div className={`absolute left-0 top-0 bottom-0 w-2 ${config.bgColor === 'bg-orange-50' ? 'bg-orange-500' :
                                                    config.bgColor === 'bg-blue-50' ? 'bg-blue-500' :
                                                        config.bgColor === 'bg-red-50' ? 'bg-red-500' :
                                                            config.bgColor === 'bg-green-50' ? 'bg-green-500' :
                                                                config.bgColor === 'bg-purple-50' ? 'bg-purple-500' : 'bg-gray-500'}`} />
                                            )}

                                            {/* Icon Section */}
                                            <div className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:rotate-[10deg] ${config.bgColor} ${isUrgent ? 'ring-4 ring-red-100 animate-pulse' : 'shadow-sm'}`}>
                                                <IconComponent className={`w-8 h-8 lg:w-10 lg:h-10 ${config.textColor}`} />
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg ${config.bgColor} ${config.textColor}`}>
                                                        {config.label}
                                                    </span>
                                                    {isUrgent && (
                                                        <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase tracking-[0.15em] shadow-lg shadow-red-200">
                                                            Urgent Action
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-md">
                                                        <Clock className="w-3 h-3" />
                                                        {getTimeAgo(n.createdAt)}
                                                    </span>
                                                </div>

                                                <h3 className={`font-black text-lg lg:text-xl mb-1 tracking-tight leading-tight transition-colors ${isUnread ? 'text-gray-900 group-hover:text-orange-600' : 'text-gray-500'}`}>
                                                    {n.title}
                                                </h3>
                                                <p className={`text-sm leading-relaxed font-medium transition-colors ${isUnread ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {n.body}
                                                </p>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                                {isUnread && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkRead(n._id);
                                                        }}
                                                        className="p-3 bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 group/btn"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCheck className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                                                    </button>
                                                )}

                                                {n.actionUrl && (
                                                    <div className={`p-3 rounded-2xl transition-all transform ${isUnread ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500'} group-hover:translate-x-1`}>
                                                        <ExternalLink className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Floating Pagination Bar */}
                {pagination.pages > 1 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-10 z-40 lg:w-fit w-full mb-15 lg:mb-0 px-4 pointer-events-none">
                        <motion.footer
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-gray-900/40 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-4 shadow-2xl border border-white/5 pointer-events-auto ring-1 ring-white/10"
                        >
                            <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest hidden sm:block">Page</span>
                                <span className="text-xs font-black text-white px-2 py-1 bg-white/10 rounded-lg">
                                    {pagination.page}
                                </span>
                                <span className="text-white/20">/</span>
                                <span className="text-xs font-bold text-white/60">{pagination.pages}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 hover:bg-white/10 text-white rounded-xl disabled:opacity-20 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-1 px-1">
                                    {(() => {
                                        const pages = [];
                                        const total = pagination.pages;
                                        const current = pagination.page;

                                        if (total <= 5) {
                                            for (let i = 1; i <= total; i++) pages.push(i);
                                        } else {
                                            pages.push(1);
                                            if (current > 3) pages.push('...');

                                            const start = Math.max(2, current - 1);
                                            const end = Math.min(total - 1, current + 1);

                                            if (current <= 3) {
                                                for (let i = 2; i <= 4; i++) pages.push(i);
                                                pages.push('...');
                                            } else if (current >= total - 2) {
                                                pages.push('...');
                                                for (let i = total - 3; i <= total - 1; i++) pages.push(i);
                                            } else {
                                                for (let i = start; i <= end; i++) pages.push(i);
                                                pages.push('...');
                                            }
                                            pages.push(total);
                                        }

                                        // Remove duplicates and manage ellipses
                                        const uniquePages = [...new Set(pages)];

                                        return uniquePages.map((p, i) => (
                                            p === '...' ? (
                                                <span key={`dots-${i}`} className="text-white/20 font-bold px-1 text-[10px]">..</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => handlePageChange(p)}
                                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${current === p ? 'bg-orange-500 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        ));
                                    })()}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-2 hover:bg-white/10 text-white rounded-xl disabled:opacity-20 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.footer>
                    </div>
                )}
            </main>
        </div>
    );
}
