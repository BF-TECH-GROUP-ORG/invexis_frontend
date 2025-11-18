"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  X,
  Home,
  User,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "@/store/authActions";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function TopNavBar({ expanded = true }) {
  const locale = useLocale();
  const { user } = useSelector((state) => state.auth);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Invoice",
      desc: "Boost efficiency, save time & money",
      time: "9:50 AM",
    },
    {
      id: 2,
      title: "Invoice",
      desc: "Boost efficiency, save time & money",
      time: "9:50 AM",
    },
    {
      id: 3,
      title: "Invoice",
      desc: "Boost efficiency, save time & money",
      time: "9:50 AM",
    },
  ];

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push(`/${locale}/auth/login`);
  };

  return (
    <>
      {/* ================= TOP NAV ================= */}
      <header
        className={`
          sticky top-0 z-40 flex items-center justify-between 
          px-3 md:px-4 py-4 bg-white/80 backdrop-blur-sm 
          transition-all duration-300 ease-in-out
        `}
        style={{ marginLeft: expanded ? "16rem" : "5rem" }}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="ml-1 px-2 py-1 font-semibold text-lg text-gray-700">
            Welcome {user?.username || "USER"}!
          </span>
        </div>

        <div className="flex-1" />

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* ====== SEARCH ====== */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search"
              className="pl-9 pr-3 py-3 rounded-xl bg-gray-100 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-orange-300 
                         transition w-36 md:w-48 lg:w-64"
              aria-label="Search"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>

          {/* ====== NOTIFICATIONS ====== */}
          <div className="relative">
            <Bell
              className="w-7 h-7 text-gray-500 hover:text-orange-500 cursor-pointer transition"
              onClick={() => setNotifOpen(true)}
            />
            {notifications.length > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-orange-500 text-white 
                           text-xs rounded-full px-1.5 py-0.5 animate-pulse"
              >
                {notifications.length}
              </span>
            )}
          </div>

          {/* ====== SETTINGS ====== */}
          <Settings className="hidden md:block w-7 h-7 text-gray-500 hover:text-orange-500 cursor-pointer transition" />

          {/* ====== PROFILE AVATAR ====== */}
          <div>
            <Image
              src={user?.profileImage || "/images/user3.jpg"}
              alt={user?.username || "User Avatar"}
              width={40}
              height={40}
              className="w-12 h-12 rounded-full border-2 border-orange-200 
                         cursor-pointer object-cover"
              onClick={() => setProfileOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* ============================================================
               PROFILE SIDEBAR
      ============================================================ */}
      <AnimatePresence>
        {profileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setProfileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full 
                         bg-white shadow-xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button onClick={() => setProfileOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              {/* USER INFO */}
              <div className="flex flex-col items-center mt-6">
                <Image
                  src={user?.profileImage || "/images/user3.jpg"}
                  alt="Avatar"
                  width={90}
                  height={90}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                />

                <h3 className="mt-3 text-lg font-bold">{user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>

                {/* TEAM */}
                <div className="flex gap-2 mt-4">
                  {(user?.team?.length ? user.team : [1, 2, 3]).map(
                    (member, idx) => (
                      <Image
                        key={idx}
                        src={member?.profileImage || "/images/default-avatar.png"}
                        alt="Team"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )
                  )}

                  <button className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-200">
                    +
                  </button>
                </div>
              </div>

              {/* NAVIGATION */}
              <nav className="mt-10 px-4 space-y-2">
                <Link
                  href={`/${locale}`}
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <Home className="w-5 h-5 text-gray-500" /> Home
                </Link>

                <Link
                  href={`/${locale}/account/profile`}
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-gray-500" /> Profile
                </Link>
              </nav>

              {/* LOGOUT */}
              <div className="px-4 py-10">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-500 text-white font-semibold 
                             rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================
                 NOTIFICATIONS SIDEBAR
      ============================================================ */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setNotifOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full 
                         bg-white shadow-xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button onClick={() => setNotifOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 
                               hover:bg-gray-100 transition"
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{n.title}</h4>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                    <span className="text-xs text-gray-400">{n.time}</span>
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
