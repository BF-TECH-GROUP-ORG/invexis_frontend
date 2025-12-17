"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Package, CreditCard, Info, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useLoading } from "@/contexts/LoadingContext";
import { useSocket } from "@/providers/SocketProvider";
import { subscribeToNotifications } from "@/utils/socket";
import { getNotifications, markNotificationsRead } from "@/services/notificationService";

export default function TopNavBar({ expanded = true, isMobile = false }) {
  const locale = useLocale();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const { setLoading, setLoadingText } = useLoading();

  const { socket } = useSocket();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const typeFilter = activeTab === 'all' ? undefined :
        activeTab === 'sales' ? 'sales_alert' :
          activeTab === 'inventory' ? 'inventory_alert' :
            activeTab === 'system' ? 'system_update' : undefined;

      // Map 'system' tab to include multiple types if needed, for now exact match or mapped
      // If the backend supports exact match on 'type' we send it.
      // If we want multiple types for one tab, we might need to filter client side or enhance backend.
      // For this implementation, we assume 1-to-1 or perform client-side filtering if 'type' param isn't enough.
      // Let's rely on backend filtering for efficiency.

      const res = await getNotifications({
        unreadOnly: true,
        limit: 20,
        type: typeFilter
      });

      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
        // Note: total count might be just for this filter. 
        // For the badge, we usually want TOTAL unread regardless of filter.
        // So we might need a separate call for the badge count if we want it global.
        // For now, let's just show count of what's loaded or maybe we shouldn't filter the BADGE count by tab.
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  // Fetch initial notifications on mount and when tab changes
  useEffect(() => {
    if (session?.user?.id && notifOpen) {
      fetchNotifs();
    }
  }, [session?.user?.id, notifOpen, activeTab]);

  // Initial global badge count (separate from tab filtering)
  useEffect(() => {
    async function fetchGlobalCount() {
      try {
        const res = await getNotifications({ unreadOnly: true, limit: 1 });
        if (res.success && res.data?.pagination) {
          setUnreadCount(res.data.pagination.total);
        }
      } catch (e) { }
    }
    if (session?.user?.id) fetchGlobalCount();
  }, [session?.user?.id]);


  useEffect(() => {
    if (socket && user?.id) {
      subscribeToNotifications(socket, user.id, (data) => {
        // Assume socket data matches API structure or map it
        const newNotification = {
          _id: data._id || data.id || Date.now().toString(),
          title: data.title || "New Notification",
          body: data.message || data.body || data.desc || "",
          type: data.type || "info",
          priority: data.priority || "normal",
          createdAt: new Date().toISOString(),
          readBy: [], // It's new
          payload: data.payload || {}
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
  }, [socket, user?.id]);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead({ all: true });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

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


  const handleNotificationClick = (n) => {
    // 1. Mark as read
    if (!n.readBy?.includes(user?.id)) {
      markNotificationsRead({ notificationIds: [n._id] }).catch(console.error);
      // Optimistic update
      setNotifications(prev => prev.filter(item => item._id !== n._id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // 2. Navigate based on type
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
      case 'system_update':
      default:
        // Maybe open a modal or just show details
        break;
    }
  };

  const handleLogout = async () => {
    try {
      // Immediately show loader and set text
      setLoadingText("Logging out...");
      setLoading(true);

      // Close profile sidebar
      setProfileOpen(false);

      // Sign out without redirecting (we'll handle navigation manually)
      await signOut({ redirect: false });

      // Navigate to login page - loader will stay visible during navigation
      await router.push(`/${locale}/auth/login`);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Ensure loader is disabled after navigation attempt
      setLoading(false);
    }
  };



  return (
    <>
      {/* ================= TOP NAV ================= */}
      <header
        className={`sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 transition-all duration-300 ${isMobile
          ? "px-4 py-3" // Mobile: full width, smaller padding
          : "px-6 py-2" // Desktop: adjusted for sidebar
          }`}
        style={isMobile ? {} : { marginLeft: expanded ? "16rem" : "5rem" }}
      >
        {/* LEFT - LOGO */}
        <div className="flex items-center">
          <span className="text-lg md:text-xl font-bold text-gray-900">
            INVEX<span className="text-orange-500 font-extrabold">iS</span>
          </span>
        </div>

        {/* CENTER - SEARCH BAR */}
        <div className="flex-1 max-w-xs md:max-w-2xl mx-4 md:mx-8">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 md:pl-12 pr-4 md:pr-6 py-2 md:py-3 bg-gray-100 rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* RIGHT - NOTIFICATIONS + USER */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <div className="relative">
            <Bell
              className="w-5 h-5 md:w-6 md:h-6 text-gray-600 cursor-pointer hover:text-orange-500 transition"
              onClick={() => setNotifOpen(true)}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-orange-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {/* User Avatar + Info */}
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-gray-50 rounded-xl px-2 md:px-3 py-2 transition"
            onClick={() => setProfileOpen(true)}
          >
            {!isMobile && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username || "John Doe"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "john.doe@example.com"}
                </p>
              </div>
            )}
            <div className="relative">
              <Image
                src={
                  user?.profilePicture ||
                  user?.profileImage ||
                  "/images/user1.jpeg"
                }
                alt={user?.username || "User Avatar"}
                width={40}
                height={40}
                className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover ring-2 ring-orange-300"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= PROFILE SIDEBAR ================= */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setProfileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Profile</h2>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  X
                </button>
              </div>

              <div className="p-8 text-center">
                <Image
                  src={
                    user?.profilePicture ||
                    user?.profileImage ||
                    "/images/user1.jpeg"
                  }
                  alt={user?.username || "Avatar"}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full mx-auto ring-4 ring-orange-400"
                />
                <h3 className="mt-4 text-2xl font-bold">{user?.username}</h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>

              <nav className="px-6 space-y-1">
                <Link
                  href={`/${locale}/inventory/dashboard`}
                  prefetch={true}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/${locale}/account/profile`}
                  prefetch={true}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                >
                  Profile Settings
                </Link>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= NOTIFICATION SIDEBAR ================= */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setNotifOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    X
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-4 pt-2 border-b flex gap-4 overflow-x-auto no-scrollbar">
                {['all', 'sales', 'inventory', 'system'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 flex flex-col gap-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="relative flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-gray-100 shadow-sm overflow-hidden"
                      onClick={() => handleNotificationClick(n)}
                    >
                      {/* Priority Color Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(n.priority)}`} />

                      <div className="flex items-start gap-3 w-full pl-2">
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          {getIconByType(n.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{n.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.body}</p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
