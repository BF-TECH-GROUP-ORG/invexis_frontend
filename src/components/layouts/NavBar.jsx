"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "next-intl";

// Component Components
import NotificationSideBar from "./Notifications_Sidebar";
import ProfileSidebar from "./ProfileSidebar";

// Providers
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/contexts/LoadingContext";
<<<<<<< HEAD
import { useSocket } from "@/providers/SocketProvider";
// formatDistanceToNow removed (notifications sidebar removed)
=======
>>>>>>> ee6354253011d07f786750d0dd276328671c50a5

// Redux
import { useSelector } from "react-redux";
import { selectUnreadCount } from "@/features/announcements/announcementsSlice";
import { useAnnouncementSocket } from "@/hooks/useAnnouncementSocket";

export default function TopNavBar({ expanded = true, isMobile = false }) {
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const { setLoading, setLoadingText } = useLoading();

<<<<<<< HEAD
  const { socket } = useSocket();

  const [profileOpen, setProfileOpen] = useState(false);

=======
>>>>>>> ee6354253011d07f786750d0dd276328671c50a5
  // Redux State
  const unreadCount = useSelector(selectUnreadCount);

  // Initialize Socket Global Listener
  useAnnouncementSocket();

  // User from session
  const user = session?.user;

  // Sidebar States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Shortcut logic: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayUser = user || {
    username: "Guest",
    email: "guest@example.com",
    profileImage: "/images/user1.jpeg",
  };

  const displayName = user
    ? user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Guest";

  const handleLogout = async () => {
    try {
      setLoadingText("Logging out...");
      setLoading(true);
      setProfileOpen(false);

      // Sign out from NextAuth
      await signOut({ redirect: false });

      router.push(`/${locale}/auth/login`);
    } catch (error) {
      console.error("Logout failed:", error);
      showNotification({
        severity: "error",
        message: "Logout failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ======= TOP NAVBAR ======= */}
      <header
        className={`fixed top-0 right-0 z-50 flex items-center justify-between px-6 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ease-in-out`}
        style={{
          left: isMobile ? "0" : expanded ? "16rem" : "5rem",
          width: isMobile
            ? "100%"
            : expanded
            ? "calc(100% - 16rem)"
            : "calc(100% - 5rem)",
        }}
      >
        {/* Left Section - Logo (Visible on mobile or if needed) */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <span className="font-bold text-lg text-gray-950 whitespace-nowrap">
            INVEX<span className="text-orange-500 font-extrabold">iS</span>
          </span>
        </div>

        {/* Middle Section - Modern Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search anything..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-gray-100/80 border border-transparent focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 text-sm transition-all outline-none"
              aria-label="Search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-medium text-gray-500 shadow-sm">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-medium text-gray-500 shadow-sm">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section - Icons and Profile */}
        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          {/* Notifications Trigger */}
          <button
            className="relative p-2.5 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all group overflow-visible"
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />

          {/* User Profile Trigger */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 p-1.5 pl-1.5 pr-3 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-gray-50/50 transition-all group active:scale-95"
          >
            <div className="relative">
              <Image
                src={
                  displayUser.profilePicture ||
                  displayUser.profileImage ||
                  "/images/user1.jpeg"
                }
                alt={displayName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white group-hover:border-orange-200 shadow-sm object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden lg:flex flex-col items-start translate-y-[1px]">
              <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-tight opacity-70">
                {user?.role || "Team Member"}
              </p>
            </div>
            <ChevronDown
              size={16}
              className="text-gray-400 group-hover:text-orange-500 transition-all hidden md:block"
            />
          </button>
        </div>
      </header>

      {/* SIDEBARS */}
      <ProfileSidebar
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <NotificationSideBar
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
