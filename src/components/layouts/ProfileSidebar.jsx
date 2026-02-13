"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Settings, LogOut, ChevronRight, Shield, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function ProfileSidebar({ open, onClose, user, onLogout }) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const locales = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
    { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  ];

  const handleLocaleChange = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
    : "Guest";

  return (
    <AnimatePresence>
      {open && (
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
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Account</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="p-8 text-center border-b relative overflow-hidden group">
              <div className="absolute inset-0 bg-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full mx-auto ring-4 ring-white shadow-lg overflow-hidden relative">
                  <Image
                    src={
                      user?.profilePicture ||
                      user?.profileImage ||
                      "/images/user1.jpeg"
                    }
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                {displayName}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{user?.email}</p>

              {user?.role && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                  <Shield size={12} className="mr-1" />
                  {user.role}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <nav className="p-6 space-y-2">
                <Link
                  href={`/${locale}/account/profile`}
                  onClick={onClose}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-orange-50 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors text-gray-600 group-hover:text-orange-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        My Profile
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        Account settings and more
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all"
                  />
                </Link>

                <Link
                  href={`/${locale}/settings`}
                  onClick={onClose}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-orange-50 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors text-gray-600 group-hover:text-orange-600">
                      <Settings size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        Preferences
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        Regional and system settings
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all"
                  />
                </Link>

                {/* Language Switcher Section */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-2 mb-4 px-4">
                    <Globe size={16} className="text-orange-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {t("nav.language") || "Language"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {locales.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleLocaleChange(l.code)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${locale === l.code
                            ? "border-orange-200 bg-orange-50 text-orange-700 shadow-sm"
                            : "border-gray-100 bg-gray-50/50 text-gray-600 hover:bg-gray-100 hover:border-gray-200"
                          }`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <span className={`text-xs font-bold ${locale === l.code ? "opacity-100" : "opacity-70"}`}>
                          {l.name}
                        </span>
                        {locale === l.code && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            {/* Logout */}
            <div className="p-6 border-t bg-gray-50/50">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 group"
              >
                <motion.div
                  whileHover={{ rotate: -15, x: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <LogOut size={20} className="group-hover:text-red-500" />
                </motion.div>
                Logout Account
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
