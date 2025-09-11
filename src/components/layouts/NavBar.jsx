"use client";

import { useState, useRef, useEffect } from "react";
import { Search,
         Bell,
         Users,
         Settings,
         ChevronDown,
         } from "lucide-react";

export default function TopNavBar({ expanded = true }) {
  const [notifications] = useState(4);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const sidebarRem = expanded ? 16 : 5;
  const style = {
    width: `calc(100% - ${sidebarRem}rem)`,
  };

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-3 md:px-4 py-4
        transition-all duration-300 ease-in-out bg-white/80 backdrop-blur-sm left-80`}
      style={style}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="hidden sm:flex items-center gap-2 whitespace-nowrap min-w-0">
          <span className="ml-1 px-2 py-1 font-semibold text-l rounded bg-gray-100 text-gray-600">
            Admin
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search"
            className="pl-8 pr-3 py-1 rounded bg-gray-100 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-orange-200 transition w-36 md:w-48 lg:w-64"
            aria-label="Search"
          />
          <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
        </div>
   

        {/* Notifications */}
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-500" />
          {notifications > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full 
                         px-1.5 leading-none transform translate-x-1 animate-pulse"
              aria-hidden
            >
              {notifications}
            </span>
          )}
        </div>

        {/* Users & Settings (hide settings on xs) */}
        <Settings className="hidden md:block w-5 h-5 text-gray-500" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <img
            src="/avatar.jpg"
            alt="Profile"
            className="w-8 h-8 rounded-full border-2 border-orange-200 cursor-pointer"
            onClick={() => setProfileOpen((s) => !s)}
          />

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50 transition-opacity duration-200"
              role="menu"
            >
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Profile
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Settings
              </button>
              <div className="border-t" />
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
