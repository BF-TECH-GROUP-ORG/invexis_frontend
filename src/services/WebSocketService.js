import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.userId = null;
        this.listeners = new Map();
    }

    /**
     * Connect to the WebSocket Server
     * @param {string} token - JWT token
     * @param {string} userId - User ID
     * @param {Array<string>} initialRooms - Initial rooms to join (optional)
     */
    connect(token, userId, initialRooms = []) {
        if (this.socket?.connected && this.userId === userId) {
            console.log('[WebSocket] 🟡 Already connected as', userId);
            return this.socket;
        }

        // If reconnecting with different user, disconnect first
        if (this.socket && this.userId !== userId) {
            console.log('[WebSocket] 🔄 Reconnecting with different user');
            this.disconnect();
        }

        this.userId = userId;
        let gatewayUrl = process.env.NEXT_PUBLIC_API_URL_SW || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        // If we have NEXT_PUBLIC_API_URL pointing to /api, we should use the base for websocket
        // or explicitly use NEXT_PUBLIC_API_URL_SW if it's the root.
        if (gatewayUrl.endsWith('/api')) {
            gatewayUrl = gatewayUrl.replace(/\/api$/, '');
        }

        if (!gatewayUrl) {
            console.error('[WebSocket] ❌ No Gateway URL found in environment variables');
            return;
        }

        // Clean URL to prevent namespace errors if path is included
        const cleanUrl = gatewayUrl.replace(/\/$/, '').replace(/\/api$/, '');

        console.log(`[WebSocket] 🔌 Connecting to ${cleanUrl}...`);

        try {
            this.socket = io(cleanUrl, {
                path: '/socket.io',
                auth: {
                    token: token,
                    userId: userId,
                },
                transports: ['websocket'], // Prefer pure websocket for efficiency through gateway
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 20, // Increase attempts for robustness
                timeout: 20000,
                extraHeaders: {
                    "ngrok-skip-browser-warning": "true",
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('[WebSocket] ❌ Initialization Error:', error.message);
            return;
        }

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log(`[WebSocket] 🟢 Connected! (User: ${userId})`);

            // Automatically join personal room
            const rooms = [...new Set([`user:${userId}`, ...initialRooms])];
            this.joinRooms(rooms);
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log(`[WebSocket] 🔴 Disconnected: ${reason}`);
        });

        this.socket.on('connect_error', (err) => {
            console.error('[WebSocket] ⚠️ Connection Error:', err.message);
        });

        // Listen for notification events
        this.socket.on('notification', (data) => {
            console.log('[WebSocket] 🔔 New Notification Received:', data);
            this._emit('notification', data);
        });
    }

    /**
   * Disconnect from the WebSocket Server
   */
    disconnect() {
        if (this.socket && this.isConnected) {
            console.log(`[WebSocket] 🔴 Disconnecting from room: user:${this.userId}`);
            this.socket.disconnect();
            this.isConnected = false;
        }
        this.socket = null;
        this.userId = null;
    }

    /**
     * Join specified rooms
     * @param {Array<string>|string} rooms 
     */
    joinRooms(rooms) {
        if (!this.socket) return;
        const roomArray = Array.isArray(rooms) ? rooms : [rooms];
        this.socket.emit('join', roomArray);
        console.log(`[WebSocket] 🏠 Joining rooms: ${roomArray.join(', ')}`);
    }

    /**
     * Leave specified rooms
     * @param {Array<string>|string} rooms 
     */
    leaveRooms(rooms) {
        if (!this.socket) return;
        const roomArray = Array.isArray(rooms) ? rooms : [rooms];
        this.socket.emit('leave', roomArray);
        console.log(`[WebSocket] 🚪 Leaving rooms: ${roomArray.join(', ')}`);
    }

    /**
     * Subscribe to internal event listeners
     * @param {string} event - 'notification' etc.
     * @param {function} callback 
     */
    subscribe(event, callback) {
        console.log(`[WebSocket] 🎧 Subscribing to internal event: ${event}`);
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Unsubscribe from internal event listeners
     * @param {string} event 
     * @param {function} callback 
     */
    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // Internal emitter
    _emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
}

// Singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
