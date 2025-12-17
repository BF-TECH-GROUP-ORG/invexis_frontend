import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const USE_MOCK_SOCKET = true; // Set to false when backend is ready
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;
const listeners = new Map();

// Mock Data Store
let mockAnnouncements = [
    {
        id: 'ann_1',
        type: 'sale',
        category: 'primary',
        title: 'Sale completed - Order #INV-2341',
        context: 'Customer: John Doe · $230 · MoMo',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
        isRead: false,
        entityId: 'INV-2341',
        actions: ['view_invoice', 'view_sale']
    },
    {
        id: 'ann_2',
        type: 'inventory',
        category: 'primary',
        title: 'Low stock alert',
        context: 'Product: iPhone Charger · 5 left',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        isRead: false,
        entityId: 'prod_005',
        actions: ['view_product', 'restock']
    },
    {
        id: 'ann_3',
        type: 'payment',
        category: 'primary',
        title: 'Payment received',
        context: 'Invoice #INV-2309 · Bank Transfer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
        isRead: true,
        entityId: 'INV-2309',
        actions: ['view_invoice']
    },
    {
        id: 'ann_4',
        type: 'update',
        category: 'updates',
        title: 'Price updated',
        context: 'Samsung Galaxy S24 price adjusted by Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        isRead: false,
        entityId: 'prod_002',
        actions: ['view_log']
    },
    {
        id: 'ann_5',
        type: 'promotion',
        category: 'promotions',
        title: 'Summer Sale Started',
        context: '15% off all Electronics active now',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isRead: true,
        entityId: 'promo_sum_24',
        actions: ['view_campaign']
    }
];

// Helper to simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class AnnouncementService {
    constructor() {
        this.isConnected = false;
    }

    // Initialize connection (WebSocket or Mock)
    connect(token) {
        if (this.isConnected) return;

        if (USE_MOCK_SOCKET) {
            console.log('🔶 [AnnouncementService] Mock Socket Connected');
            this.isConnected = true;
            this._startMockEventLoop();
        } else {
            socket = io(API_URL, {
                auth: { token },
                path: '/api/socket.io' // Adjust based on your backend config
            });

            socket.on('connect', () => {
                console.log('✅ [AnnouncementService] Socket Connected:', socket.id);
                this.isConnected = true;
            });

            socket.on('announcement:new', (data) => {
                this._notifyListeners('new', data);
            });

            socket.on('disconnect', () => {
                console.log('❌ [AnnouncementService] Socket Disconnected');
                this.isConnected = false;
            });
        }
    }

    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        this.isConnected = false;
        this._stopMockEventLoop(); // Clean up mock loop
    }

    // Subscribe to real-time updates
    on(event, callback) {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            const eventListeners = listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
        };
    }

    // Basic API Methods
    async getAnnouncements(filters = {}) {
        await delay();
        let data = [...mockAnnouncements];

        // Simple filter application
        if (filters.category) {
            data = data.filter(a => a.category === filters.category);
        }

        // Sort by timestamp desc
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return { data };
    }

    async markAsRead(id) {
        await delay(100);
        const item = mockAnnouncements.find(a => a.id === id);
        if (item) {
            item.isRead = true;
            this._notifyListeners('update', item); // Notify local state
        }
        return true;
    }

    async delete(id) {
        await delay(200);
        mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
        this._notifyListeners('delete', id);
        return true;
    }

    async snooze(id, durationMs) {
        await delay(100);
        const item = mockAnnouncements.find(a => a.id === id);
        if (item) {
            // In a real app, backend handles this. For mock, we'll just "hide" it or mark it snoozed.
            // Let's just remove it from the list for now to simulate "snoozed away" behavior.
            console.log(`💤 Snoozing item ${id} for ${durationMs}ms`);
            // Simulating snoozed behavior by filtering it out in subsequent fetch (or just notify UI to remove)
            this._notifyListeners('delete', id); // UI should remove it
        }
        return true;
    }

    // INTERNAL: Notify subscribed listeners
    _notifyListeners(event, data) {
        const eventListeners = listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(cb => cb(data));
        }
    }

    // INTERNAL: Mock Event Generator
    _startMockEventLoop() {
        // Generate a random event every 30-60 seconds
        if (this.mockInterval) clearInterval(this.mockInterval);

        this.mockInterval = setInterval(() => {
            // 10% chance to generate an event every 5 seconds check
            if (Math.random() > 0.3) return;

            const types = ['sale', 'inventory', 'payment', 'system', 'social'];
            const type = types[Math.floor(Math.random() * types.length)];

            let newEvent = {
                id: `ann_${uuidv4()}`,
                timestamp: new Date().toISOString(),
                isRead: false,
                actions: ['view']
            };

            switch (type) {
                case 'sale':
                    newEvent = { ...newEvent, category: 'primary', type: 'sale', title: 'New Sale Completed', context: `Order #INV-${Math.floor(Math.random() * 1000)} · $${Math.floor(Math.random() * 500)}.00` };
                    break;
                case 'inventory':
                    newEvent = { ...newEvent, category: 'primary', type: 'inventory', title: 'Low Stock Warning', context: `Product variants running low in Main Warehouse` };
                    break;
                case 'payment':
                    newEvent = { ...newEvent, category: 'primary', type: 'payment', title: 'Payment Confirmed', context: `Received payment via MoMo` };
                    break;
                case 'system':
                    newEvent = { ...newEvent, category: 'updates', type: 'update', title: 'System Backup', context: 'Daily backup completed successfully' };
                    break;
                case 'social':
                    newEvent = { ...newEvent, category: 'social', type: 'user', title: 'Team Mention', context: 'Manager mentioned you in a comment' };
                    break;
            }

            console.log('⚡ [AnnouncementService] Emitting mock event:', newEvent.title);
            mockAnnouncements.unshift(newEvent); // Add to local store
            this._notifyListeners('new', newEvent);

        }, 5000);
    }

    _stopMockEventLoop() {
        if (this.mockInterval) clearInterval(this.mockInterval);
    }

    // Debug method to force trigger an event
    triggerTestEvent() {
        const newEvent = {
            id: `ann_test_${Date.now()}`,
            type: 'alert',
            category: 'primary',
            title: '⚠️ TEST EMERGENCY ALERT',
            context: 'This is a test event triggered manually',
            timestamp: new Date().toISOString(),
            isRead: false
        };
        mockAnnouncements.unshift(newEvent);
        this._notifyListeners('new', newEvent);
    }
}

export const announcementService = new AnnouncementService();
export default announcementService;
