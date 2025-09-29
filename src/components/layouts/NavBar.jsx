"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  X,
  Home,
  User,
  Shield,
  Folder,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function TopNavBar({ expanded = true }) {
  const [notifications] = useState([
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
  ]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const sidebarRem = expanded ? 16 : 5;
  const style = {
    width: `calc(100% - ${sidebarRem}rem)`,
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <header
        className={`sticky top-0 z-40 flex items-center justify-between px-3 md:px-4 py-4
        transition-all duration-300 ease-in-out bg-white/80 backdrop-blur-sm left-80`}
        style={style}
      >
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="ml-1 px-2 py-1 font-semibold text-l rounded bg-gray-100 text-gray-600">
            Admin
          </span>
        </div>

        <div className="flex-1" />

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search"
              className="pl-8 pr-3 py-2 rounded bg-gray-100 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-orange-200 transition w-36 md:w-48 lg:w-64"
              aria-label="Search"
            />
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Bell
              className="w-7 h-7 text-gray-500 hover:text-orange-500 cursor-pointer"
              onClick={() => setNotifOpen(true)}
            />
            {notifications.length > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full 
                           px-1.5 leading-none transform translate-x-1 animate-pulse"
                aria-hidden
              >
                {notifications.length}
              </span>
            )}
          </div>

          {/* Settings */}
          <Settings className="hidden md:block w-7 h-7 text-gray-500 hover:text-orange-500 cursor-pointer" />

          {/* Profile */}
          <div>
            <Image
              src="/images/mkg20.jpg"
              alt="profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-orange-200 cursor-pointer"
              onClick={() => setProfileOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* ================= PROFILE SIDEBAR ================= */}
      <AnimatePresence>
        {profileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/0 z-40"
              onClick={() => setProfileOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full bg-white shadow-lg z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button onClick={() => setProfileOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex flex-col items-center mt-6">
                <Image
                  src="/images/mkg20.jpg"
                  alt="profile"
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-orange-500"
                />
                <h3 className="mt-3 text-lg font-bold">Marc NGABONZIZA</h3>
                <p className="text-sm text-gray-500">Ngabonziza@gmail.com</p>

                {/* Extra Avatars */}
                <div className="flex gap-2 mt-4">
                  <Image
                    src="/images/mkg20.jpg"
                    alt="team1"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <Image
                    src="/images/mkg20.jpg"
                    alt="team2"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <Image
                    src="/images/mkg20.jpg"
                    alt="team3"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <button className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-500">
                    +
                  </button>
                </div>
              </div>
              {/* Navigation */}
              <nav className="mt-10 px-4">
                <button className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100">
                  <Home className="w-5 h-5 text-gray-500" /> Home
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100">
                  <User className="w-5 h-5 text-gray-500" /> Profile
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100">
                  <Folder className="w-5 h-5 text-gray-500" /> Projects
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 rounded-full">
                    3
                  </span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100">
                  <Shield className="w-5 h-5 text-gray-500" /> Security
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100">
                  <Settings className="w-5 h-5 text-gray-500" /> Account
                  settings
                </button>
              </nav>

              {/* Upgrade Box */}
              <div className="m-4 p-8 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg text-center">
                <h4 className="text-sm font-semibold">35% OFF</h4>
                <p className="text-m">Power up Productivity!</p>
                <button className="mt-4 px-3 py-1 bg-yellow-400 text-black rounded font-bold">
                  Upgrade to Pro
                </button>
              </div>

              {/* Logout */}
              <div className="px-4 py-15">
                <button className="w-full text-center py-2 bg-red-500 text-white font-semibold rounded hover:bg-white hover:text-red-500 hover:border-red-500 hover:border-2">
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
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/0 z-40"
              onClick={() => setNotifOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full bg-white shadow-lg z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button onClick={() => setNotifOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="p-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    {/* Avatar/Icon */}
                    <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{n.title}</h4>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                    {/* Time */}
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
