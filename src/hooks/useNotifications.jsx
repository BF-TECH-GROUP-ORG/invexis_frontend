"use client";

import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { io } from 'socket.io-client';
import { useNotification } from '@/providers/NotificationProvider';
import { useSession } from 'next-auth/react';

// Use environment variables for URLs with fallbacks
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL_SW || "http://localhost:9002";

export const useNotifications = () => {
    const { data: session } = useSession();
    const { showNotification, hideNotification } = useNotification();
    const initialized = useRef(false);

    useEffect(() => {
        console.log('[Notifications] Hook Effect triggered', {
            hasSession: !!session?.accessToken,
            initialized: initialized.current,
            permission: typeof window !== 'undefined' ? Notification.permission : 'n/a'
        });

        // Only run when session is available and we haven't initialized yet
        if (!session?.accessToken || initialized.current) return;

        console.log('[Notifications] Initializing notification setup...');
        const user = session.user;
        const token = session.accessToken;
        initialized.current = true;

        // 1. Setup Firebase Messaging (Push)
        const setupPush = async () => {
            if (!messaging) {
                console.error('[Notifications] Firebase Messaging not initialized.');
                return;
            }

            hideNotification?.(); // Dismiss the invitation toast

            try {
                // Check if we already have a cached token for this user
                const cachedTokenKey = `fcm_token_${user.id || user._id}`;
                const lastSyncKey = `fcm_last_sync_${user.id || user._id}`;
                const cachedToken = localStorage.getItem(cachedTokenKey);
                const lastSync = localStorage.getItem(lastSyncKey);

                // Periodic Sync: 7 days in milliseconds
                const SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000;
                const needsSync = !lastSync || (Date.now() - parseInt(lastSync)) > SYNC_INTERVAL;

                console.log('[Notifications] Requesting notification permission...');
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    console.log('[Notifications] Permission granted. Registering Service Worker...');

                    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                        scope: '/'
                    });

                    console.log('[Notifications] Fetching FCM Token...');
                    const fcmToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                        serviceWorkerRegistration: registration
                    });

                    if (fcmToken) {
                        // Check if the token has actually changed OR if it's time for a periodic sync
                        if (cachedToken === fcmToken && !needsSync) {
                            console.log('[Notifications] FCM Token already cached and synced recently. Skipping registration.');
                            return;
                        }

                        console.log(needsSync ? '[Notifications] Periodic sync triggered.' : '[Notifications] Token changed. Registering...');

                        // Register token with Auth Service
                        let deviceUrl = API_URL.replace(/\/+$/, "");

                        if (deviceUrl.includes('/api/auth')) {
                            if (!deviceUrl.endsWith('/devices')) {
                                deviceUrl = deviceUrl.split('/api/auth')[0] + '/api/auth/devices';
                            }
                        } else if (deviceUrl.includes('/api')) {
                            deviceUrl = deviceUrl.split('/api')[0] + '/api/auth/devices';
                        } else {
                            deviceUrl = `${deviceUrl}/api/auth/devices`;
                        }

                        const payload = {
                            fcmToken,
                            deviceType: 'web',
                            deviceName: window.navigator.userAgent
                        };

                        try {
                            const response = await fetch(deviceUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(payload)
                            });

                            if (response.ok) {
                                console.log('[Notifications] Device registered successfully');
                                localStorage.setItem(cachedTokenKey, fcmToken);
                                localStorage.setItem(lastSyncKey, Date.now().toString());

                                // Only show success toast if it's a new registration or changed token (not on periodic sync)
                                if (cachedToken !== fcmToken) {
                                    showNotification({
                                        message: 'Real-time alerts are now fully synced with your device!',
                                        severity: 'success',
                                        duration: 5000,
                                        icon: '/images/Invexix Logo-Light Mode.png'
                                    });
                                }
                            } else {
                                const errorData = await response.json().catch(() => ({}));
                                console.error('[Notifications] Backend registration failed:', response.status, errorData);

                                // Auto-Recovery: Clear cache on 400/401/404 to force fresh sync next time
                                if ([400, 401, 404].includes(response.status)) {
                                    localStorage.removeItem(cachedTokenKey);
                                    localStorage.removeItem(lastSyncKey);
                                }
                            }
                        } catch (fetchErr) {
                            console.error('[Notifications] Network error during device registration:', fetchErr);
                        }
                    } else {
                        console.warn('[Notifications] getToken returned null');
                    }
                } else {
                    console.log('[Notifications] Permission denied or dismissed');
                }
            } catch (err) {
                console.error('[Notifications] Push Registration Flow Failed:', err);
            }
        };

        // 2. Setup WebSocket (In-App Alerts)
        // Convert wss:// to http:// if needed for the socket client or just use it as is if it's the right format
        const socketBase = SOCKET_URL.startsWith('wss://')
            ? SOCKET_URL.replace('wss://', 'https://')
            : SOCKET_URL.startsWith('ws://')
                ? SOCKET_URL.replace('ws://', 'http://')
                : SOCKET_URL;

        const socket = io(socketBase, {
            auth: { token: token },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to Notification Socket');
        });

        socket.on('notification', (notif) => {
            console.log('In-App Notification Received:', notif);
            showNotification({
                message: notif.message || notif.body || 'New Notification',
                severity: notif.severity || 'info',
                duration: 6000,
                icon: '/images/Invexix Logo-Light Mode.png'
            });
        });

        // Listen for foreground FCM messages
        let unsubscribeFCM = null;
        if (messaging) {
            unsubscribeFCM = onMessage(messaging, async (payload) => {
                console.log('Foreground Push Received:', payload);

                const title = payload.notification?.title || 'Invexis Notification';
                const options = {
                    body: payload.notification?.body || 'New alert from Invexis',
                    icon: '/images/Invexix Logo-Light Mode.png',
                    badge: '/images/Invexix Logo-Light Mode.png',
                    tag: payload.data?.type || 'general',
                    data: payload.data
                };

                // 1. Show Toast
                showNotification({
                    message: options.body,
                    severity: 'info',
                    duration: 8000,
                    icon: options.icon
                });

                // 2. Explicitly trigger browser notification even in foreground
                try {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration) {
                        registration.showNotification(title, options);
                    }
                } catch (swErr) {
                    console.warn('Failed to show foreground browser notification:', swErr);
                }
            });
        }

        // Professional Permission Request
        const checkPermissionAndSetup = async () => {
            if (typeof window === 'undefined' || !('Notification' in window)) return;

            if (Notification.permission === 'default') {
                // Show a clean, professional invitation via the notification provider
                showNotification({
                    message: (
                        <div className="flex flex-col gap-3">
                            <div>
                                <h4 className="font-bold text-sm mb-1">Enable Real-Time Alerts</h4>
                                <p className="text-xs opacity-90 leading-relaxed">Stay updated with stock movements, expirations, and critical system alerts instantly.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setupPush();
                                    }}
                                    className="bg-[#FF6B00] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#E66000] transition-all shadow-md active:scale-95"
                                >
                                    Enable
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        hideNotification();
                                    }}
                                    className="bg-black/5 text-[#FF6B00] border border-[#FF6B00]/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/10 transition-all active:scale-95"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    ),
                    severity: 'info',
                    duration: 0 // PERSISTENT: Won't disappear unless clicked
                });
            } else if (Notification.permission === 'granted') {
                setupPush();
            }
        };

        checkPermissionAndSetup();

        return () => {
            if (socket) socket.disconnect();
            if (unsubscribeFCM) unsubscribeFCM();
            initialized.current = false;
        };
    }, [session, showNotification]);
};

export default useNotifications;