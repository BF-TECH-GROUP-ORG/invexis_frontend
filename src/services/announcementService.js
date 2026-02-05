import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '@/lib/apiClient';

// Configuration
const USE_MOCK_SOCKET = process.env.NEXT_PUBLIC_USE_ANNOUNCEMENT_MOCK === 'true' ? true : false; // toggle via env
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
        isArchived: false,
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
        isArchived: false,
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
        isArchived: false,
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
        isArchived: false,
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
        isArchived: false,
        entityId: 'promo_sum_24',
        actions: ['view_campaign']
    }
    ,
    // Debt example for tracking customer debts
    {
        id: 'ann_6',
        type: 'debt',
        category: 'debts',
        title: 'Outstanding balance for Customer: Jane Doe',
        context: 'Customer Jane Doe has an outstanding debt of $1,250 for Invoice #INV-2201 (due 2024-11-01)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
        isRead: false,
        isArchived: false,
        entityId: 'INV-2201',
        actions: ['view_invoice', 'contact_customer']
    },
    // Mock Archived Item
    {
        id: 'ann_archived_1',
        type: 'system',
        category: 'primary',
        title: 'Old System Alert (Archived)',
        context: 'This happened a long time ago',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        isRead: true,
        isArchived: true,
        entityId: 'sys_old',
        actions: []
    }
];

// Helper to simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class AnnouncementService {
    constructor() {
        this.isConnected = false;
        this.token = null;
        // base endpoint for notifications
        const base = API_URL.replace(/\/$/, '');
        if (base.endsWith('/api')) {
            // API_URL already contains /api, avoid duplicating it
            this.apiBase = `${base}/notification`;
        } else {
            this.apiBase = `${base}/api/notification`;
        }
    }

    // Map incoming announcement type to a category for consistency
    _mapCategory(item) {
        if (!item) return item;
        const t = (item.type || '').toLowerCase();
        // Inventory/Updates category
        const updatesTypes = ['confirmation', 'receipt', 'billing', 'statement', 'update', 'system', 'inventory', 'stock', 'restock'];
        // Payments & Customers category  
        const socialTypes = ['agreement', 'user_agreement', 'consent', 'workflow', 'workflow_action', 'task', 'assignment', 'mention', 'comment', 'agreement_signed', 'user', 'payment', 'customer'];
        // Sales category
        const promotionsTypes = ['promotion', 'discount', 'offer', 'sale', 'coupon', 'promo'];
        // Debts category
        const debtTypes = ['debt', 'owed', 'arrears', 'debt_check', 'debt_notice'];

        if (updatesTypes.includes(t)) return { ...item, category: 'updates' };
        if (socialTypes.includes(t)) return { ...item, category: 'social' };
        if (promotionsTypes.includes(t)) return { ...item, category: 'promotions' };
        if (debtTypes.includes(t)) return { ...item, category: 'debts' };
        // default to primary/general
        if (!item.category) return { ...item, category: 'primary' };
        return item;
    }

    // Initialize connection (WebSocket or Mock)
    connect(token) {
        if (this.isConnected) return;
        this.token = token || null;

        if (USE_MOCK_SOCKET) {
            console.log('🔶 [AnnouncementService] Mock Socket Connected');
            this.isConnected = true;
            this._startMockEventLoop();
        } else {
            socket = io(API_URL, {
                auth: { token },
                path: '/socket.io' // Adjust based on your backend config
            });

            socket.on('connect', () => {
                console.log('✅ [AnnouncementService] Socket Connected:', socket.id);
                this.isConnected = true;
            });

            socket.on('announcement:new', (data) => {
                this._notifyListeners('new', data);
            });

            socket.on('announcement:update', (data) => {
                this._notifyListeners('update', data);
            });

            socket.on('announcement:delete', (data) => {
                this._notifyListeners('delete', data);
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
        // If using mock socket or mock mode, return local mockAnnouncements (normalized)
        if (USE_MOCK_SOCKET) {
            await delay();
            let data = mockAnnouncements.map(a => this._mapCategory({ ...a }));

            // Filter by archive status
            const showArchived = filters.archived === true || filters.archived === 'true';
            data = data.filter(a => !!a.isArchived === showArchived);

            if (filters.category && !showArchived) {
                // Only filter by category if NOT viewing archive (Archive shows all categories)
                data = data.filter(a => a.category === filters.category);
            }

            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return { data };
        }

        // Build query parameters
        const params = {};
        if (filters.page) params.page = String(filters.page);
        if (filters.limit) params.limit = String(filters.limit);
        if (filters.unreadOnly) params.unreadOnly = String(filters.unreadOnly);
        if (filters.category) params.category = String(filters.category);
        if (filters.role) params.role = String(filters.role);
        if (filters.companyId) params.companyId = String(filters.companyId);
        if (filters.archived !== undefined) params.archived = String(filters.archived);

        try {
            // Use apiClient.get with retry and error handling
            const json = await apiClient.get(this.apiBase, { params, retries: 2 });

            // Expecting { success: true, data: { notifications: [...], pagination: {} } }
            const notifications = json?.data?.notifications || [];

            // Normalize categories
            const data = notifications.map(n => this._mapCategory({
                id: n._id || n.id,
                type: n.type,
                category: n.category,
                title: n.title || n.message?.title || n.body,
                context: n.body || JSON.stringify(n.payload || n.data || {}),
                timestamp: n.createdAt || n.timestamp,
                isRead: Array.isArray(n.readBy) ? n.readBy.length > 0 : !!n.isRead,
                isArchived: !!n.isArchived,
                payload: n.payload || n.data || {},
            }));

            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return { data };
        } catch (error) {
            // If backend fails, fall back to mock data
            console.warn('[AnnouncementService] Backend request failed, falling back to mock announcements:', error.message);
            await delay();
            let data = mockAnnouncements.map(a => this._mapCategory({ ...a }));

            const showArchived = filters.archived === true || filters.archived === 'true';
            data = data.filter(a => !!a.isArchived === showArchived);

            if (filters.category && !showArchived) {
                data = data.filter(a => a.category === filters.category);
            }

            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return { data };
        }
    }

    async getAnnouncement(id) {
        if (USE_MOCK_SOCKET) {
            await delay(100);
            const found = mockAnnouncements.find(a => a.id === id);
            if (!found) return { data: null };
            return { data: this._mapCategory({ ...found }) };
        }

        try {
            const url = `${this.apiBase}/${id}`;
            const json = await apiClient.get(url, { retries: 2 });
            const n = json?.data || json;
            if (!n) return { data: null };

            const mapped = this._mapCategory({
                id: n._id || n.id,
                type: n.type,
                category: n.category,
                title: n.title || n.message?.title || n.body,
                context: n.body || JSON.stringify(n.payload || n.data || {}),
                timestamp: n.createdAt || n.timestamp,
                isRead: Array.isArray(n.readBy) ? n.readBy.length > 0 : !!n.isRead,
                payload: n.payload || n.data || {},
            });
            return { data: mapped };
        } catch (error) {
            console.error(`[AnnouncementService] Failed to load announcement ${id}:`, error.message);
            throw error;
        }
    }

    async markAsRead(id) {
        if (USE_MOCK_SOCKET) {
            await delay(100);
            const item = mockAnnouncements.find(a => a.id === id);
            if (item) {
                item.isRead = true;
                this._notifyListeners('update', this._mapCategory({ ...item }));
            }
            return true;
        }

        try {
            // API: POST /mark-read with { notificationIds: [...] }
            const url = `${this.apiBase}/mark-read`;
            const json = await apiClient.post(url, { notificationIds: [id] }, { retries: 2 });

            // Optionally notify listeners by fetching the updated item
            try {
                const { data } = await this.getAnnouncement(id);
                if (data) this._notifyListeners('update', data);
            } catch (e) { /* ignore */ }
            return json;
        } catch (error) {
            console.error('[AnnouncementService] Failed to mark as read:', error.message);
            throw error;
        }
    }

    async delete(id) {
        if (USE_MOCK_SOCKET) {
            await delay(200);
            mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
            this._notifyListeners('delete', id);
            return true;
        }

        try {
            const url = `${this.apiBase}/${id}`;
            await apiClient.delete(url, { retries: 1 });
            this._notifyListeners('delete', id);
            return true;
        } catch (error) {
            console.error(`[AnnouncementService] Failed to delete announcement ${id}:`, error.message);
            throw error;
        }
    }

    async snooze(id, durationMs) {
        if (USE_MOCK_SOCKET) {
            await delay(100);
            const item = mockAnnouncements.find(a => a.id === id);
            if (item) {
                console.log(`💤 Snoozing item ${id} for ${durationMs}ms`);
                this._notifyListeners('delete', id);
            }
            return true;
        }

        try {
            // Try to call API endpoint: PATCH /:id/snooze
            const url = `${this.apiBase}/${id}/snooze`;
            const json = await apiClient.patch(url, { durationMs }, { retries: 2 });
            this._notifyListeners('update', json?.data || {});
            return json;
        } catch (error) {
            // If backend doesn't support snooze, fall back to remove/mark locally
            console.warn('[AnnouncementService] Snooze not supported, falling back to delete');
            try {
                await this.delete(id);
            } catch (e) { /* ignore */ }
            return false;
        }
    }

    async archive(id) {
        if (USE_MOCK_SOCKET) {
            await delay(100);
            const item = mockAnnouncements.find(a => a.id === id);
            if (item) {
                item.isArchived = true;
                // Emit update so clients can decide to filter it out or move it
                this._notifyListeners('update', this._mapCategory({ ...item }));
            }
            return true;
        }

        try {
            // API: POST /:id/archive
            const url = `${this.apiBase}/${id}/archive`;
            const json = await apiClient.post(url, {}, { retries: 2 });
            const data = json?.data || json;
            this._notifyListeners('update', this._mapCategory(data));
            return true;
        } catch (error) {
            // Fallback: if specific endpoint fails, try patching
            try {
                const patchUrl = `${this.apiBase}/${id}`;
                const json = await apiClient.patch(patchUrl, { isArchived: true }, { retries: 2 });
                const data = json?.data || json;
                this._notifyListeners('update', this._mapCategory(data));
                return true;
            } catch (patchError) {
                console.error(`[AnnouncementService] Failed to archive announcement ${id}:`, patchError.message);
                throw patchError;
            }
        }
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

            const types = ['sale', 'inventory', 'payment', 'system', 'social', 'debt'];
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
                case 'debt':
                    newEvent = { ...newEvent, category: 'debts', type: 'debt', title: 'Debt Alert', context: `Customer ${['John', 'Jane', 'Acme'][Math.floor(Math.random() * 3)]} has overdue balance $${Math.floor(Math.random() * 2000)} for recent invoices` };
                    break;
                case 'system':
                    newEvent = { ...newEvent, category: 'updates', type: 'update', title: 'System Backup', context: 'Daily backup completed successfully' };
                    break;
                case 'social':
                    newEvent = { ...newEvent, category: 'social', type: 'user', title: 'Team Mention', context: 'Manager mentioned you in a comment' };
                    break;
            }

            // Normalize category before storing/emitting
            const normalized = this._mapCategory(newEvent);
            console.log('⚡ [AnnouncementService] Emitting mock event:', normalized.title);
            mockAnnouncements.unshift(normalized); // Add to local store
            this._notifyListeners('new', normalized);

        }, 5000);
    }

    _stopMockEventLoop() {
        if (this.mockInterval) clearInterval(this.mockInterval);
    }

    // Debug method to force trigger an event
    async triggerTestEvent() {
        if (USE_MOCK_SOCKET) {
            const newEvent = {
                id: `ann_test_${Date.now()}`,
                type: 'alert',
                category: 'primary',
                title: '⚠️ TEST EMERGENCY ALERT',
                context: 'This is a test event triggered manually',
                timestamp: new Date().toISOString(),
                isRead: false
            };
            const normalized = this._mapCategory(newEvent);
            mockAnnouncements.unshift(normalized);
            this._notifyListeners('new', normalized);
            return normalized;
        }

        // Create a notification via API for testing (requires auth)
        try {
            const url = `${this.apiBase}`;
            const payload = {
                type: 'test_alert',
                recipient: 'all',
                message: { title: 'Test Alert', body: 'This is a server-generated test notification' },
                data: { test: true }
            };
            const json = await apiClient.post(url, payload, { retries: 1 });
            const created = json?.data || json;
            const mapped = this._mapCategory({
                id: created._id || created.id,
                type: created.type,
                category: created.category,
                title: created.title || created.message?.title,
                context: created.body || created.message?.body,
                timestamp: created.createdAt || new Date().toISOString(),
                isRead: false,
                payload: created.payload || created.data
            });
            this._notifyListeners('new', mapped);
            return mapped;
        } catch (error) {
            console.error('[AnnouncementService] Failed to trigger test event:', error.message);
            throw error;
        }
    }
}

export const announcementService = new AnnouncementService();
export default announcementService;
