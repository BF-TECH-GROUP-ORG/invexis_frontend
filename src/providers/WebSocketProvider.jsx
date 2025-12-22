"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import webSocketService from "@/services/WebSocketService";
import { addNotification, fetchNotificationsThunk } from "@/features/NotificationSlice";

/**
 * WebSocket Provider that manages real-time notifications
 * This hooks into the lifecycle and establishes/disconnects WebSocket connection
 */
export default function WebSocketProvider({ children }) {
    const { data: session } = useSession();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!session?.accessToken || !session?.user?._id) {
            // Not authenticated, do nothing
            return;
        }

        const token = session.accessToken;
        const userId = session.user._id;

        console.log('[WebSocketProvider] Initializing connection for user:', userId);

        // Connect to WebSocket
        webSocketService.connect(token, userId);

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

            // Optionally: Show toast/banner notification
            // showToast(data.title);
        };

        webSocketService.subscribe('notification', handleNotification);

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
