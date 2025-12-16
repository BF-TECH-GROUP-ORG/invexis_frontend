"use client";

import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useLoading } from "@/contexts/LoadingContext";
import { useSocket } from "@/providers/SocketProvider";
import { subscribeToNotifications } from "@/utils/socket";

export default function TopNavBar({ expanded = true, isMobile = false }) {
  const locale = useLocale();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const { setLoading, setLoadingText } = useLoading();

  const { socket } = useSocket();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket && user?.id) {
      subscribeToNotifications(socket, user.id, (data) => {
        const newNotification = {
          id: data.id || Date.now(),
          title: data.title || "New Notification",
          desc: data.message || data.desc || "",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setNotifications((prev) => [newNotification, ...prev]);
      });
    }
  }, [socket, user?.id]);

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

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      dispatch(markAnnouncementRead(n.id));
    }
    // Optional: navigate to details
    // router.push(`/${locale}/inventory/announcements?id=${n.id}`);
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
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-orange-500 text-white text-xs rounded-full">
                {notifications.length}
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
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  X
                </button>
              </div>
              <div className="p-4">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition cursor-pointer border-b last:border-0"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium">{n.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{n.desc}</p>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
