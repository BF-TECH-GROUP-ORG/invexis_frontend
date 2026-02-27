"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import webSocketService from "@/services/WebSocketService";
import {
    addNotification,
    fetchNotificationsThunk,
    markReadLocally,
    removeNotificationLocally
} from "@/features/NotificationSlice";
import { useNotification } from "@/providers/NotificationProvider";

/**
 * WebSocket Provider that manages real-time notifications
 * This hooks into the lifecycle and establishes/disconnects WebSocket connection
 */
export default function WebSocketProvider({ children }) {
    const { data: session } = useSession();
    const dispatch = useDispatch();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!session?.accessToken || !session?.user?._id) {
            // Not authenticated, do nothing
            return;
        }

        const token = session.accessToken;
        const userId = session.user._id;
        const companyId = session.user.companyId;
        const shopId = session.user.shopId || session.user.shops?.[0];

        // Construct initial rooms to join
        const rooms = [];
        if (companyId) rooms.push(`company:${companyId}`);
        if (shopId) rooms.push(`shop:${shopId}`);

        console.log('[WebSocketProvider] Initializing connection for user:', userId, 'with rooms:', rooms);

        // Connect to WebSocket
        webSocketService.connect(token, userId, rooms);

        // Subscribe to notification events
        const handleNotification = (data) => {
            console.log('[WebSocketProvider] Real-time notification received:', data);

            // Dispatch to Redux store
            dispatch(addNotification({
                _id: data._id || data.id || Date.now().toString(),
                title: data.title || 'New Notification',
                body: data.body || data.message || '',
                intent: data.intent || 'operational',
                priority: data.priority || 'normal',
                type: data.type,
                createdAt: data.createdAt || new Date().toISOString(),
                readBy: data.readBy || [], // New notifications are usually unread
                actionUrl: data.actionUrl || null,
                payload: data.payload || {}
            }));

            // Show toast/banner notification
            showNotification({
                message: data.body || data.message || 'New notification received',
                severity: data.priority === 'high' ? 'warning' : 'info',
                duration: 5000,
                // If the notification has an icon in payload, we can use it
                icon: data.payload?.icon || null
            });
        };

        const handleNotificationRead = (data) => {
            console.log('[WebSocket] 📖 Notification read event:', data);
            dispatch(markReadLocally({ notificationId: data.notificationId }));
        };

        const handleNotificationDeleted = (data) => {
            console.log('[WebSocket] 🗑️ Notification deleted event:', data);
            dispatch(removeNotificationLocally({ notificationId: data.notificationId }));
        };

        webSocketService.subscribe('notification', handleNotification);
        webSocketService.subscribe('notification.read', handleNotificationRead);
        webSocketService.subscribe('notification.deleted', handleNotificationDeleted);

        // Note: Don't fetch notifications here - let individual components fetch when they open
        // This prevents errors if the API isn't ready or if the user isn't fully authenticated

        // Cleanup on unmount or session change
        return () => {
            console.log('[WebSocketProvider] Cleaning up connection');
            webSocketService.unsubscribe('notification', handleNotification);
            webSocketService.disconnect();
        };
    }, [session?.accessToken, session?.user?._id, dispatch]);

    return <>{children}</>;
}
