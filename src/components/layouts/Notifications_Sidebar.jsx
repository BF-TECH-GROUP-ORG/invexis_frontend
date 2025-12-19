"use client";

import { useState } from "react";
import { X, Bell, Info, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationSideBar({ isOpen, onClose }) {
  // Mock notifications - in a real app, these would come from global state or a hook
  const [notifications] = useState([
    {
      id: 1,
      type: "order",
      title: "New Order #1234",
      desc: "A new order has been placed by Sarah Johnson.",
      time: "2 mins ago",
      severity: "success",
    },
    {
      id: 2,
      type: "inventory",
      title: "Low Stock Alert",
      desc: "iPhone 15 Pro stock is below threshold (2 left).",
      time: "1 hour ago",
      severity: "warning",
    },
    {
      id: 3,
      type: "system",
      title: "System Update",
      desc: "Invexis will undergo maintenance at 2 AM UTC.",
      time: "5 hours ago",
      severity: "info",
    },
  ]);

  const getIcon = (severity) => {
    switch (severity) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
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
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Bell size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Notifications
                </h2>
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
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-orange-100 hover:bg-orange-50/30 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex-shrink-0 pt-1">
                      {getIcon(n.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-orange-700 transition-colors">
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {n.desc}
                      </p>
                    </div>
                  </div>
                ))
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
            <div className="p-6 border-t bg-gray-50/50">
              <button className="w-full py-3 text-sm font-bold text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-all shadow-sm">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
