"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCheckCircle,
  HiExclamation,
  HiXCircle,
  HiInformationCircle,
  HiX,
  HiDuplicate,
} from "react-icons/hi";
import { notificationBus } from "@/lib/notificationBus";

const isDev = process.env.NEXT_PUBLIC_APP_PHASE === "development";

const NotificationContext = createContext(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}

export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Load position from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPos = localStorage.getItem("notification_position");
      if (savedPos) {
        try {
          setPosition(JSON.parse(savedPos));
        } catch (e) {
          console.error("Failed to parse notification position", e);
        }
      }
    }
  }, []);

  const showNotification = useCallback(
    ({ message, severity = "info", duration = 10000, icon = null }) => {
      const id = Date.now();
      setNotification({ id, message, severity, duration, icon });

      if (duration > 0) {
        setTimeout(() => {
          setNotification((prev) => (prev?.id === id ? null : prev));
        }, duration);
      }
    },
    []
  );

  // Subscribe to global bus
  useEffect(() => {
    const unsubscribe = notificationBus.subscribe((note) => {
      showNotification(note);
    });
    return unsubscribe;
  }, [showNotification]);

  const handleClose = () => {
    setNotification(null);
  };

  const handleDragEnd = (event, info) => {
    const currentX = position.x + info.offset.x;
    const currentY = position.y + info.offset.y;
    setPosition({ x: currentX, y: currentY });
    localStorage.setItem(
      "notification_position",
      JSON.stringify({ x: currentX, y: currentY })
    );
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    if (notification?.message) {
      navigator.clipboard.writeText(notification.message);
      // Optional: change icon to checkmark briefly? For now just copy.
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case "success":
        return <HiCheckCircle size={28} color="#34D399" />;
      case "error":
        return <HiXCircle size={28} color="#F87171" />;
      case "warning":
        return <HiExclamation size={28} color="#FBBF24" />;
      default:
        return <HiInformationCircle size={28} color="#60A5FA" />;
    }
  };

  const getTheme = (severity) => {
    switch (severity) {
      case "success":
        return {
          bg: "#ECFDF5",
          color: "#065F46",
          shadow: "rgba(16, 185, 129, 0.25)",
        };
      case "error":
        return {
          bg: "#FEF2F2",
          color: "#991B1B",
          shadow: "rgba(239, 68, 68, 0.25)",
        };
      case "warning":
        return {
          bg: "#FFFBEB",
          color: "#92400E",
          shadow: "rgba(245, 158, 11, 0.25)",
        };
      default:
        return {
          bg: "#EFF6FF",
          color: "#1E40AF",
          shadow: "rgba(59, 130, 246, 0.25)",
        };
    }
  };

  const theme = notification ? getTheme(notification.severity) : {};

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification: handleClose }}>
      {children}
      <AnimatePresence>
        {notification && (
          <motion.div
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.8, y: 100, x: position.x }}
            animate={{ opacity: 1, scale: 1, y: position.y, x: position.x }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 9999,
              cursor: "move",
            }}
          >
            <div
              style={{
                backdropFilter: "blur(12px)",
                background: theme.bg,
                borderRadius: "24px",
                boxShadow: `0 20px 25px -5px ${theme.shadow}, 0 10px 10px -5px ${theme.shadow}`,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                minWidth: "340px",
                maxWidth: "450px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                {notification.icon ? (
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "white",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                  >
                    <img
                      src={notification.icon}
                      alt="Notification Icon"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      borderRadius: "50%",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getIcon(notification.severity)}
                  </div>
                )}

                <div style={{ flex: 1, paddingTop: "4px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: theme.color,
                      fontSize: "16px",
                      textTransform: "capitalize",
                      marginBottom: "4px",
                    }}
                  >
                    {notification.severity}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: theme.color,
                      fontSize: "14px",
                      lineHeight: "1.5",
                      fontWeight: 500,
                      opacity: 0.9,
                    }}
                  >
                    {notification.message}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: theme.color,
                    padding: "6px",
                    display: "flex",
                    transition: "all 0.2s",
                  }}
                >
                  <HiX size={20} />
                </button>

                {isDev && (
                  <button
                    onClick={handleCopy}
                    title="Copy message"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      color: theme.color,
                      padding: "6px",
                      display: "flex",
                      transition: "all 0.2s",
                    }}
                  >
                    <HiDuplicate size={20} />
                  </button>
                )}
              </div>

              {notification.duration > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "4px",
                    background: theme.color,
                    width: "100%",
                    opacity: 0.2,
                  }}
                >
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{
                      duration: notification.duration / 1000,
                      ease: "linear",
                    }}
                    style={{
                      height: "100%",
                      background: theme.color,
                      opacity: 1,
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}
